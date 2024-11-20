# Import Required Libraries 
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error
from keras.models import Sequential
from keras.layers import LSTM, Dense, Dropout, Input
from keras.callbacks import EarlyStopping
import yfinance as yf
import os

# Define ticker, start date, and end date
ticker = 'META'
start_date = '2010-01-01'
end_date = '2024-11-20'

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
early_stop = EarlyStopping(monitor='val_loss', patience=30, restore_best_weights=True)

# Train the model with validation
history = model.fit(X_train, y_train, epochs=50, batch_size=32, 
                    validation_split=0.2, callbacks=[early_stop], verbose=1)

# Save the model after training
model.save('models/lstm_stock_model.keras')

# Plot training history
plt.figure(figsize=(12, 6))
plt.plot(history.history['loss'], label='Training Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.title('Model Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.legend()
plt.show()

# Make predictions
y_pred = model.predict(X_test)
y_pred_inverse = scaler.inverse_transform(np.concatenate((y_pred, test_data[time_step:, 1:]), axis=1))[:, 0]

# Calculate metrics
mse = mean_squared_error(scaler.inverse_transform(test_data[time_step:])[:, 0], y_pred_inverse)
mae = mean_absolute_error(scaler.inverse_transform(test_data[time_step:])[:, 0], y_pred_inverse)
print(f'MSE: {mse}, MAE: {mae}')

# Plot actual vs predicted
test_dates = data.index[train_size + time_step:]
plt.figure(figsize=(14,5))
plt.plot(test_dates, scaler.inverse_transform(test_data[time_step:])[:, 0], color='blue', label='Actual Price')
plt.plot(test_dates, y_pred_inverse, color='red', label='Predicted Price')
plt.xlabel('Date')
plt.ylabel('Stock Price')
plt.legend()
plt.show()

# Future Prediction - Predicting next N days
def predict_future(model, last_data, n_days, time_step=60):
    future_preds = []
    current_input = last_data[-time_step:].reshape(1, time_step, len(features))  # Reshape for LSTM input
    for _ in range(n_days):
        future_pred = model.predict(current_input)[0][0]  # Predict next step
        future_preds.append(future_pred)
        
        # Prepare next input for prediction:
        future_input = np.zeros((1, time_step, len(features)))  # Create a new array of zeros
        future_input[0, :-1, 0] = current_input[0, 1:, 0]  # Shift the values in the current input
        future_input[0, -1, 0] = future_pred  # Append the predicted value to the last time step
        
        # Copy the other features (e.g., MA50, MA200, Volatility)
        future_input[0, :-1, 1:] = current_input[0, 1:, 1:]  # Copy other features as they are
        current_input = future_input  # Update input for next prediction
    
    return future_preds

# Predict for next 30 days
n_days = 30
future_preds = predict_future(model, scaled_data, n_days)
future_preds_inverse = scaler.inverse_transform(np.concatenate((np.array(future_preds).reshape(-1, 1), np.zeros((n_days, len(features) - 1))), axis=1))[:, 0]

# Plot future predictions
future_dates = pd.date_range(start=test_dates[-1] + pd.Timedelta(days=1), periods=n_days, freq='D')
plt.figure(figsize=(14, 5))
plt.plot(test_dates, scaler.inverse_transform(test_data[time_step:])[:, 0], label='Actual Price', color='blue')
plt.plot(test_dates, y_pred_inverse, label='Predicted Price', color='red')
plt.plot(future_dates, future_preds_inverse, label=f'Future Predictions ({n_days} days)', color='green', linestyle='--')
plt.xlabel('Date')
plt.ylabel('Stock Price')
plt.legend()
plt.title('Stock Price Prediction and Future Predictions')
plt.show()

# Generate buy/sell signals for the predicted future prices
future_signals = pd.DataFrame({
    'Date': future_dates,
    'Predicted Price': future_preds_inverse,
    'Signal': 0
})

# Signal: Buy if predicted price is above MA50, Sell if below
future_signals.loc[future_signals['Predicted Price'] > data['MA50'].iloc[-1], 'Signal'] = 1  # Buy signal
future_signals.loc[future_signals['Predicted Price'] < data['MA50'].iloc[-1], 'Signal'] = -1  # Sell signal

# Plot future trading signals
plt.figure(figsize=(14, 8))
plt.plot(test_dates, scaler.inverse_transform(test_data[time_step:])[:, 0], label='Actual Price', color='blue', linewidth=1.5)
plt.plot(test_dates, y_pred_inverse, label='Predicted Price', color='red', linestyle='--', linewidth=1.5)
plt.plot(future_dates, future_preds_inverse, label='Future Predicted Price', color='green', linestyle='--', linewidth=1.5)

# Plot future buy/sell signals
plt.plot(future_signals[future_signals['Signal'] == 1]['Date'],
         future_signals[future_signals['Signal'] == 1]['Predicted Price'],
         '^', markersize=10, color='green', label='Buy Signal')

plt.plot(future_signals[future_signals['Signal'] == -1]['Date'],
         future_signals[future_signals['Signal'] == -1]['Predicted Price'],
         'v', markersize=10, color='red', label='Sell Signal')

plt.title('Future Stock Price Prediction with Buy/Sell Signals')
plt.xlabel('Date')
plt.ylabel('Stock Price')
plt.legend()
plt.xticks(rotation=45)
plt.show()

# Print the future predicted stock values and signals
print("Future Predicted Stock Prices and Buy/Sell Signals:")
print(future_signals[['Date', 'Predicted Price', 'Signal']])



