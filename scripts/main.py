# Import Necessary Libraries
import yfinance as yf
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import LSTM, Dense, Dropout, Input, BatchNormalization
from keras.callbacks import EarlyStopping
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from pandas.tseries.offsets import BDay

# Parameters
seq_length = 50
n_days = 10
batch_size = 32
epochs = 100
ticker = 'AAPL'
min_price_change = 0.01  # Minimum change in price (e.g., 1%)
error_threshold = 0.01  # Limit prediction error to ±1% (0.01)

# Fetch historical stock data
data = yf.download(ticker, start='2020-01-01', end='2024-11-23')

# Adding technical indicators
data['SMA_50'] = data['Close'].rolling(window=50).mean()
data['SMA_200'] = data['Close'].rolling(window=200).mean()
data['RSI'] = (100 - (100 / (1 + (data['Close'].diff(1).clip(lower=0).rolling(14).mean() /
                                 data['Close'].diff(1).clip(upper=0).abs().rolling(14).mean()))))
data['EMA_12'] = data['Close'].ewm(span=12, adjust=False).mean()
data['EMA_26'] = data['Close'].ewm(span=26, adjust=False).mean()

# Drop rows with NaN values
data.dropna(inplace=True)

# Features to use
features = ['Open', 'Close', 'SMA_50', 'SMA_200', 'RSI', 'EMA_12', 'EMA_26']
data = data[features]

# Normalize the data
scaler = MinMaxScaler(feature_range=(0, 1))
scaled_data = scaler.fit_transform(data)

# Create sequences of data for LSTM
def create_sequences(data, seq_length):
    sequences, labels = [], []
    for i in range(seq_length, len(data)):
        sequences.append(data[i - seq_length:i])
        labels.append(data[i, 0:2])  # Predict Open and Close
    return np.array(sequences), np.array(labels)

X, y = create_sequences(scaled_data, seq_length)

# Train-test split
train_size = int(len(X) * 0.8)
X_train, X_test = X[:train_size], X[train_size:]
y_train, y_test = y[:train_size], y[train_size:]

# Build LSTM model
model = Sequential([
    Input(shape=(X_train.shape[1], X_train.shape[2])),
    LSTM(128, return_sequences=True),
    Dropout(0.2),
    LSTM(64, return_sequences=True),
    BatchNormalization(),
    Dropout(0.2),
    LSTM(32, return_sequences=False),
    Dense(64, activation='relu'),
    Dense(2)  # Predict Open and Close
])
model.compile(optimizer='adam', loss='mean_squared_error')

# Early stopping
early_stopping = EarlyStopping(monitor='loss', patience=30, restore_best_weights=True)

# Train the model
model.fit(X_train, y_train, epochs=epochs, batch_size=batch_size, callbacks=[early_stopping], verbose=2)

# Predict on the test set
predictions = model.predict(X_test)

# Inverse scale predictions and actual values
def inverse_transform(features, column):
    placeholder = np.zeros((len(features), scaler.n_features_in_))
    placeholder[:, column] = features
    return scaler.inverse_transform(placeholder)[:, column]

predicted_open = inverse_transform(predictions[:, 0], column=0)
predicted_close = inverse_transform(predictions[:, 1], column=1)
actual_open = inverse_transform(y_test[:, 0], column=0)
actual_close = inverse_transform(y_test[:, 1], column=1)

# Limit prediction error to ±1%
predicted_open = np.clip(predicted_open, actual_open * (1 - error_threshold), actual_open * (1 + error_threshold))
predicted_close = np.clip(predicted_close, actual_close * (1 - error_threshold), actual_close * (1 + error_threshold))

# Evaluate model
mae_open = mean_absolute_error(actual_open, predicted_open)
mae_close = mean_absolute_error(actual_close, predicted_close)
rmse_open = np.sqrt(mean_squared_error(actual_open, predicted_open))
rmse_close = np.sqrt(mean_squared_error(actual_close, predicted_close))
r2_open = r2_score(actual_open, predicted_open)
r2_close = r2_score(actual_close, predicted_close)

print(f"MAE (Open): {mae_open}, RMSE (Open): {rmse_open}, R2 (Open): {r2_open}")
print(f"MAE (Close): {mae_close}, RMSE (Close): {rmse_close}, R2 (Close): {r2_close}")

# Prepare historical test results with trading signals
signals = []
for actual, predicted in zip(actual_close, predicted_close):
    if predicted > actual * (1 + error_threshold):
        signals.append("Buy")
    elif predicted < actual * (1 - error_threshold):
        signals.append("Sell")
    else:
        signals.append("Hold")

test_results = pd.DataFrame({
    'Date': data.index[-len(actual_open):],
    'Actual Open': actual_open,
    'Predicted Open': predicted_open,
    'Actual Close': actual_close,
    'Predicted Close': predicted_close,
    'Signal': signals
})
print("\n=== Historical Test Results with Signals ===")
print(test_results)

# Prepare future predictions with trading strategy
last_sequence = scaled_data[-seq_length:]  # Last seq_length days for prediction
future_predictions = []
future_dates = []
buy_sell_signals = []

last_date = data.index[-1]
previous_close = data['Close'].iloc[-1]

for _ in range(n_days):
    last_sequence_reshaped = last_sequence.reshape((1, seq_length, last_sequence.shape[1]))
    future_price = model.predict(last_sequence_reshaped)[0]

    # Inverse transform and cap error to ±1%
    future_open = scaler.inverse_transform([[future_price[0], 0, 0, 0, 0, 0, 0]])[0][0]
    future_close = scaler.inverse_transform([[0, future_price[1], 0, 0, 0, 0, 0]])[0][1]
    future_open = np.clip(future_open, previous_close * (1 - error_threshold), previous_close * (1 + error_threshold))
    future_close = np.clip(future_close, previous_close * (1 - error_threshold), previous_close * (1 + error_threshold))

    future_predictions.append([future_open, future_close])

    # Signal logic based on future prediction
    if future_close > previous_close * (1 + error_threshold):
        buy_sell_signals.append(('Buy', future_close))
    elif future_close < previous_close * (1 - error_threshold):
        buy_sell_signals.append(('Sell', future_close))
    elif abs(future_close - previous_close) > min_price_change:  # Only Hold if there's significant movement
        buy_sell_signals.append(('Hold', future_close))
    else:
        buy_sell_signals.append(('Hold', previous_close))

    previous_close = future_close
    next_date = last_date + BDay(1)  # Advance by one business day
    future_dates.append(next_date)
    last_date = next_date

future_predictions = np.array(future_predictions)
future_results = pd.DataFrame({
    'Date': future_dates,
    'Predicted Open': future_predictions[:, 0],
    'Predicted Close': future_predictions[:, 1],
    'Signal': [signal for signal, _ in buy_sell_signals],
    'Signal Price': [price for _, price in buy_sell_signals]
})

print("\n=== Future Predictions with Signals ===")
print(future_results)


# Calculate bounds for the shaded region
upper_open = predicted_open * (1 + error_threshold)
lower_open = predicted_open * (1 - error_threshold)
upper_close = predicted_close * (1 + error_threshold)
lower_close = predicted_close * (1 - error_threshold)

# Extract future predicted open and close prices
future_predicted_open = future_predictions[:, 0]
future_predicted_close = future_predictions[:, 1]

# Calculate bounds for future predictions
future_upper_open = future_predicted_open * (1 + error_threshold)
future_lower_open = future_predicted_open * (1 - error_threshold)
future_upper_close = future_predicted_close * (1 + error_threshold)
future_lower_close = future_predicted_close * (1 - error_threshold)



# Plot historical and future data with shaded uncertainty regions
plt.figure(figsize=(14, 7))
plt.plot(data.index[-len(actual_open):], actual_open, label='Actual Open', color='blue')
plt.plot(data.index[-len(actual_close):], actual_close, label='Actual Close', color='orange')
plt.plot(data.index[-len(predicted_open):], predicted_open, linestyle='dashed', label='Predicted Open', color='green')
plt.plot(data.index[-len(predicted_close):], predicted_close, linestyle='dashed', label='Predicted Close', color='red')

# Plot future predictions
plt.plot(future_dates, future_predicted_open, linestyle='dashed', label='Future Predicted Open', color='purple')
plt.plot(future_dates, future_predicted_close, linestyle='dashed', label='Future Predicted Close', color='darkgreen')

# Shaded regions for future predictions
plt.fill_between(future_dates, future_lower_open, future_upper_open, color='olive', alpha=0.1)
plt.fill_between(future_dates, future_lower_close, future_upper_close, color='magenta', alpha=0.1)

# Initialize flags for unique legends
buy_plotted, sell_plotted = False, False

# Plot Buy/Sell/Hold signals
for date, price, signal in zip(data.index[-len(actual_close):], predicted_close, signals):
    if signal == "Buy":
        plt.scatter(date, price, color='green', label='Buy Signal' if not buy_plotted else "", marker='^', s=100, edgecolors='black')
        buy_plotted = True
    elif signal == "Sell":
        plt.scatter(date, price, color='red', label='Sell Signal' if not sell_plotted else "", marker='v', s=100, edgecolors='black')
        sell_plotted = True

plt.title(f'{ticker} Stock Price Prediction with Signals (±1% Error Threshold)')
plt.xlabel('Date')
plt.ylabel('Price')
plt.legend()
plt.grid()
plt.show()


























