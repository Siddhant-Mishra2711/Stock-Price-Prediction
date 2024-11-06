# Import Required Libraries
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import mean_squared_error, mean_absolute_error
from keras.models import Sequential
from keras.layers import LSTM, Dense, Dropout, Input
from keras.callbacks import EarlyStopping
import yfinance as yf
import os

# Define ticker, start date, and end date
ticker = 'META'
start_date = '2010-01-01'
end_date = '2024-01-01'

# Ensure 'data' directory exists
os.makedirs('data', exist_ok=True)

# Download and save the dataset to the 'data/' directory
data = yf.download(ticker, start=start_date, end=end_date)
data.to_csv(f'data/{ticker}_stock_data.csv')  # Save to 'data/' directory

# Load the data from the data directory
data = pd.read_csv(f'data/{ticker}_stock_data.csv', index_col='Date', parse_dates=True)

# Calculate Moving Averages
data['MA50'] = data['Close'].rolling(window=50).mean()
data['MA200'] = data['Close'].rolling(window=200).mean()

# Calculate other technical indicators
data['Returns'] = data['Close'].pct_change()
data['Volatility'] = data['Returns'].rolling(window=50).std()

# Fill missing values
data.bfill(inplace=True)
data.dropna(inplace=True)

# Select features
features = ['Close', 'MA50', 'MA200', 'Volatility']
target = 'Close'

scaler = MinMaxScaler(feature_range=(0, 1))
scaled_data = scaler.fit_transform(data[features])

# Split into training and testing sets
train_size = int(len(scaled_data) * 0.8)
train_data = scaled_data[:train_size]
test_data = scaled_data[train_size:]

# Prepare the data for LSTM
def create_dataset(dataset, time_step=60):
    X, y = [], []
    for i in range(time_step, len(dataset)):
        X.append(dataset[i-time_step:i])
        y.append(dataset[i, 0])
    return np.array(X), np.array(y)

time_step = 60
X_train, y_train = create_dataset(train_data, time_step)
X_test, y_test = create_dataset(test_data, time_step)

# Build LSTM Model
model = Sequential([
    Input(shape=(X_train.shape[1], X_train.shape[2])),
    LSTM(50, return_sequences=True),
    Dropout(0.2),
    LSTM(50, return_sequences=False),
    Dropout(0.2),
    Dense(25),
    Dense(1)
])

# Compile the model
model.compile(optimizer='adam', loss='mean_squared_error')

# Implement Early Stopping
early_stop = EarlyStopping(monitor='val_loss', patience=20, restore_best_weights=True)

# Train the model with validation
history = model.fit(X_train, y_train, epochs=50, batch_size=32, 
                    validation_split=0.2, callbacks=[early_stop], verbose=1)

# Save the model after training
model.save('models/lstm_stock_model.keras')

# Make predictions
y_pred = model.predict(X_test)
y_pred_inverse = scaler.inverse_transform(np.concatenate((y_pred, test_data[time_step:, 1:]), axis=1))[:, 0]

# Calculate metrics
mse = mean_squared_error(scaler.inverse_transform(test_data[time_step:])[:, 0], y_pred_inverse)
mae = mean_absolute_error(scaler.inverse_transform(test_data[time_step:])[:, 0], y_pred_inverse)
print(f'MSE: {mse}, MAE: {mae}')

# Plot training history
plt.figure(figsize=(12, 6))
plt.plot(history.history['loss'], label='Training Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Model Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.show()

# Plot actual vs predicted
test_dates = data.index[train_size + time_step:]
plt.figure(figsize=(14,5))
plt.plot(test_dates, scaler.inverse_transform(test_data[time_step:])[:, 0], color='blue', label='Actual Price')
plt.plot(test_dates, y_pred_inverse, color='red', label='Predicted Price')
plt.xlabel('Date')
plt.ylabel('Stock Price')
plt.legend()
plt.show()

# Trading Signals
test_data_df = data.iloc[train_size + time_step:].copy()
test_data_df['Predicted Price'] = y_pred_inverse
test_data_df['Signal'] = 0
test_data_df.loc[test_data_df['Predicted Price'] > test_data_df['MA50'], 'Signal'] = 1  # Buy signal
test_data_df.loc[test_data_df['Predicted Price'] < test_data_df['MA50'], 'Signal'] = -1  # Sell signal

# Display signals
print(test_data_df[['Close', 'Predicted Price', 'MA50', 'Signal']])

# Plotting with buy/sell signals
plt.figure(figsize=(14, 8))

# Plot the actual closing prices
plt.plot(test_data_df.index, test_data_df['Close'], label='Actual Price', color='blue', linewidth=1.5)

# Plot the predicted prices
plt.plot(test_data_df.index, test_data_df['Predicted Price'], label='Predicted Price', color='red', linestyle='--', linewidth=1.5)

# Plot the 50-day moving average
plt.plot(test_data_df.index, test_data_df['MA50'], label='50-Day MA', color='green', linewidth=1.5)

# Plot Buy signals
plt.plot(test_data_df[test_data_df['Signal'] == 1].index,
         test_data_df[test_data_df['Signal'] == 1]['Close'],
         '^', markersize=10, color='green', label='Buy Signal')

# Plot Sell signals
plt.plot(test_data_df[test_data_df['Signal'] == -1].index,
         test_data_df[test_data_df['Signal'] == -1]['Close'],
         'v', markersize=10, color='red', label='Sell Signal')

# Add labels and title
plt.title('Stock Price Prediction with Buy/Sell Signals')
plt.xlabel('Date')
plt.ylabel('Price')
plt.legend()
plt.xticks(rotation=45)
plt.show() 
