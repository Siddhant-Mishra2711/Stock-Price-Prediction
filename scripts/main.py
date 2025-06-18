from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
from datetime import datetime, timedelta
import pandas as pd
import json
import os
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import Dense, LSTM

app = Flask(__name__)
CORS(app)

MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

def download_data(ticker, start, end):
    df = yf.download(ticker, start=start, end=end, interval="1d")
    df.dropna(inplace=True)
    return df

def create_lstm_data(df, look_back=60):
    data = df['Close'].values.reshape(-1, 1)
    scaler = MinMaxScaler()
    data_scaled = scaler.fit_transform(data)

    X, y_class, y_reg = [], [], []
    for i in range(look_back, len(data_scaled) - 1):
        X.append(data_scaled[i - look_back:i])
        price_today = data_scaled[i][0]
        price_tomorrow = data_scaled[i + 1][0]
        y_class.append(1 if price_tomorrow > price_today else 0)
        y_reg.append(price_tomorrow)

    return (
        np.array(X),
        np.array(y_class),
        np.array(y_reg),
        scaler
    )

def train_lstm_classifier(X, y, model_path):
    if os.path.exists(model_path):
        return load_model(model_path)

    model = Sequential([
        LSTM(50, return_sequences=True, input_shape=(X.shape[1], 1)),
        LSTM(50),
        Dense(1, activation='sigmoid')
    ])
    model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])
    model.fit(X, y, epochs=10, batch_size=32, verbose=0)
    model.save(model_path)
    return model

def train_lstm_regressor(X, y, model_path):
    if os.path.exists(model_path):
        return load_model(model_path)

    model = Sequential([
        LSTM(50, return_sequences=True, input_shape=(X.shape[1], 1)),
        LSTM(50),
        Dense(1)
    ])
    model.compile(loss='mean_squared_error', optimizer='adam')
    model.fit(X, y, epochs=10, batch_size=32, verbose=0)
    model.save(model_path)
    return model

@app.route('/api/prediction', methods=['GET'])
def predict_stock():
    try:
        # Step 1: Get User Inputs
        ticker_name = request.args.get('name')
        months = int(request.args.get('month'))
        sequence_length = 60

        end_date = datetime.now()
        start_date = end_date - timedelta(days=months * 30)
        ticker = yf.Ticker(ticker_name)

        # Step 2: Download and Preprocess Data
        #stock_data = download_data(ticker, start_date, end_date)
        stock_data = ticker.history(start = start_date, end = end_date)
        X_class, y_class, _, scaler_class = create_lstm_data(stock_data, sequence_length)
        X_reg, _, y_reg, scaler_reg = create_lstm_data(stock_data, sequence_length)

        # Step 3: Validate Dataset Size
        if len(X_class) == 0 or len(X_reg) == 0:
            raise ValueError("Insufficient data. Use a larger date range or shorter sequence length.")

        # Step 4: Split & Reshape Data
        test_size = min(0.2, len(X_class) / 2)
        X_train_class, X_test_class, y_train_class, y_test_class = train_test_split(X_class, y_class, test_size=test_size, random_state=42)
        X_train_reg, X_test_reg, y_train_reg, y_test_reg = train_test_split(X_reg, y_reg, test_size=test_size, random_state=42)

        if len(X_train_class) < 10 or len(X_train_reg) < 10:
            raise ValueError("Training data too small for meaningful training.")

        # Reshape all inputs for LSTM
        X_train_class = X_train_class.reshape((-1, sequence_length, 1))
        X_test_class  = X_test_class.reshape((-1, sequence_length, 1))
        X_train_reg   = X_train_reg.reshape((-1, sequence_length, 1))
        X_test_reg    = X_test_reg.reshape((-1, sequence_length, 1))

        # Step 5: Train or Load Models
        model_class_path = os.path.join(MODEL_DIR, f"{ticker_name}_{months}_classifier.h5")
        model_reg_path   = os.path.join(MODEL_DIR, f"{ticker_name}_{months}_regressor.h5")

        model_class = train_lstm_classifier(X_train_class, y_train_class, model_class_path)
        model_reg   = train_lstm_regressor(X_train_reg, y_train_reg, model_reg_path)

        # Step 6: Make Predictions
        recent_data_class = X_class[-1].reshape((1, sequence_length, 1))
        movement_prob = model_class.predict(recent_data_class)[0][0]
        movement = "Increase" if movement_prob > 0.5 else "Decrease"

        recent_data_reg = X_reg[-1].reshape((1, sequence_length, 1))
        predicted_price_scaled = model_reg.predict(recent_data_reg)[0][0]
        predicted_price = scaler_reg.inverse_transform([[predicted_price_scaled]])[0][0]

        # Step 7: Output
        start_price = stock_data['Close'].iloc[0]
        end_price = stock_data['Close'].iloc[-1]

        return jsonify({
            'sdp': start_price,
            'edp': end_price,
            'move': movement,
            'ndp': predicted_price
        }), 200

    except Exception as e:
        print(f"Prediction Error: {str(e)}")  # Useful during debugging
        return jsonify({'error': str(e)}), 500
 

@app.route('/api/ml3', methods=['GET'])
def get_stock_dataa():
        # Get the 'ind' query parameter
    try:
        ind = request.args.get('ind')

        # Handle missing or invalid 'ind'
        if ind is None:
            return jsonify({'error': 'Parameter "ind" is missing'}), 400

        
        # Split the string into a list
        ind_list = ind.split(',')
        # print(ind_list)
        # print(ind_list[0])    
        #find the open, close, high, low, volume, and date of the stocks in the list for last date and return them in an array of objects
        formatted_data = []
        for i in ind_list:
            ticker = yf.Ticker(i)
            hist = ticker.history(period='1mo')
            info = dict(ticker.fast_info)
            data_point = {
                'Date': hist.index[len(hist)-1].strftime('%Y-%m-%d'),
                'Open': float(hist['Open'].iloc[-1]),
                'High': float(hist['High'].iloc[-1]),
                'Low': float(hist['Low'].iloc[-1]),
                'Close': float(hist['Close'].iloc[-1]),
                'Volume': int(hist['Volume'].iloc[-1]),
                'symbol': i,
                'fiftyTwoWeekHigh': info.get('fiftyTwoWeekHigh', 'USD'),
                'fiftyTwoWeekLow': info.get('fiftyTwoWeekLow', 'USD'),
                'fiftyDayAverage': info.get('fiftyDayAverage', 'USD'),   
                'CompanyName': info.get('longName', i),     
            }
            formatted_data.append(data_point)
        return jsonify({'data': formatted_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/news', methods=['GET'])
def get_news_data():
    tick= request.args.get('tick')
    try:
        ticker = yf.Ticker(tick)
        news = ticker.news
        return jsonify({'data': news}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/strategy', methods=['GET'])
def get_strategy_data():
    try:
        # Get parameters from the request
        ticker_name = request.args.get('name')
        months = int(request.args.get('month'))
        end_date = datetime.now()
        start_date = end_date - timedelta(days=months * 30)
        
        ticker = yf.Ticker(ticker_name)
        
        # Fetch historical data
        ticker_data = ticker.history(start=start_date, end=end_date)
        if ticker_data.empty:
            return jsonify({"error": "Invalid ticker name or no data found"}), 404
        
        # Ensure data integrity
        ticker_data = ticker_data.dropna()

        # Bollinger Bands Strategy (BBS)
        def calculate_bollinger_bands(data, window=20):
            data['SMA'] = data['Close'].rolling(window).mean()
            data['STD'] = data['Close'].rolling(window).std()
            data['BB_upper'] = data['SMA'] + (2 * data['STD'])
            data['BB_lower'] = data['SMA'] - (2 * data['STD'])
            return data

        ticker_data = calculate_bollinger_bands(ticker_data)

        def bbs_signal(row):
            if row['Close'] < row['BB_lower']:
                return 1  # Buy
            elif row['Close'] > row['BB_upper']:
                return -1  # Sell
            else:
                return 0  # Hold

        ticker_data['BBS'] = ticker_data.apply(bbs_signal, axis=1)

        # Moving Average Crossover Strategy (MAC)
        def calculate_moving_averages(data, short_window=9, long_window=21):
            data['Short_MA'] = data['Close'].rolling(short_window).mean()
            data['Long_MA'] = data['Close'].rolling(long_window).mean()
            return data

        ticker_data = calculate_moving_averages(ticker_data)

        def mac_signal(row):
            if row['Short_MA'] > row['Long_MA']:
                return 1  # Buy
            elif row['Short_MA'] < row['Long_MA']:
                return -1  # Sell
            else:
                return 0  # Hold

        ticker_data['MAC'] = ticker_data.apply(mac_signal, axis=1)

        # RSI Strategy (RSIS)
        def calculate_rsi(data, window=14):
            delta = data['Close'].diff()
            gain = delta.where(delta > 0, 0)
            loss = -delta.where(delta < 0, 0)
            avg_gain = gain.rolling(window).mean()
            avg_loss = loss.rolling(window).mean()
            rs = avg_gain / avg_loss
            data['RSI'] = 100 - (100 / (1 + rs))
            return data

        ticker_data = calculate_rsi(ticker_data)

        def rsi_signal(rsi_value):
            if rsi_value < 30:
                return 1  # Buy
            elif rsi_value > 70:
                return -1  # Sell
            else:
                return 0  # Hold

        ticker_data['RSIS'] = ticker_data['RSI'].apply(lambda x: rsi_signal(x) if pd.notna(x) else 0)

        # Exponential Moving Average Crossover Strategy (EMA)
        def calculate_ema(data, short_window=12, long_window=26):
            data['Short_EMA'] = data['Close'].ewm(span=short_window, adjust=False).mean()
            data['Long_EMA'] = data['Close'].ewm(span=long_window, adjust=False).mean()
            return data

        ticker_data = calculate_ema(ticker_data)

        def ema_signal(row):
            if row['Short_EMA'] > row['Long_EMA']:
                return 1  # Buy
            elif row['Short_EMA'] < row['Long_EMA']:
                return -1  # Sell
            else:
                return 0  # Hold

        ticker_data['EMA'] = ticker_data.apply(ema_signal, axis=1)

        # Stochastic Oscillator Strategy
        def calculate_stochastic(data, k_window=14, d_window=3):
            data['L14'] = data['Low'].rolling(window=k_window).min()
            data['H14'] = data['High'].rolling(window=k_window).max()
            data['%K'] = (data['Close'] - data['L14']) / (data['H14'] - data['L14']) * 100
            data['%D'] = data['%K'].rolling(window=d_window).mean()
            return data

        ticker_data = calculate_stochastic(ticker_data)

        def stochastic_signal(row):
            if row['%K'] < 20 and row['%K'] < row['%D']:
                return 1  # Buy
            elif row['%K'] > 80 and row['%K'] > row['%D']:
                return -1  # Sell
            else:
                return 0  # Hold

        ticker_data['Stochastic'] = ticker_data.apply(stochastic_signal, axis=1)

        # Average True Range (ATR)
        def calculate_atr(data, window=14):
            data['TR'] = data[['High', 'Low', 'Close']].apply(
                lambda x: max(x[0] - x[1], abs(x[0] - x[2]), abs(x[1] - x[2])), axis=1)
            data['ATR'] = data['TR'].rolling(window).mean()
            return data

        ticker_data = calculate_atr(ticker_data)

        def atr_signal(row, threshold=0.05):
            if row['ATR'] / row['Close'] > threshold:
                return 1  # Buy
            else:
                return 0  # Hold

        ticker_data['ATR_Signal'] = ticker_data.apply(lambda row: atr_signal(row), axis=1)

        # Collect the most recent signals
        allresult = {
            'BBS': int(ticker_data['BBS'].iloc[-1]),
            'MAC': int(ticker_data['MAC'].iloc[-1]),
            'RSIS': int(ticker_data['RSIS'].iloc[-1]),
            'EMA': int(ticker_data['EMA'].iloc[-1]),
            'Stochastic': int(ticker_data['Stochastic'].iloc[-1]),
            'ATR': int(ticker_data['ATR_Signal'].iloc[-1])
        }

        return jsonify(allresult)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/ml2', methods=['GET'])
def get_stock_data():
    try:
        ticker_name = request.args.get('name')
        months = int(request.args.get('month', 1))

        if not ticker_name:
            return jsonify({'error': 'Ticker name is required'}), 400

        end_date = datetime.now()
        start_date = end_date - timedelta(days=months * 30)

        ticker = yf.Ticker(ticker_name)

        try:
            hist = ticker.history(start=start_date, end=end_date)
        except Exception as e:
            return jsonify({'error': f'Failed to fetch history: {str(e)}'}), 500

        if hist.empty:
            return jsonify({'error': 'No data found for the given ticker and time range.'}), 404
        info = ticker.info

        company_name = info.get('longName', ticker_name)
        currency = info.get('currency', 'USD')

        formatted_data = []
        for i in range(len(hist)):
            data_point = {
                'Date': hist.index[i].strftime('%Y-%m-%d'),
                'Open': float(hist['Open'].iloc[i]),
                'High': float(hist['High'].iloc[i]),
                'Low': float(hist['Low'].iloc[i]),
                'Close': float(hist['Close'].iloc[i]),
                'Volume': int(hist['Volume'].iloc[i]),
                'CompanyName': company_name,
                'Currency': currency
            }
            formatted_data.append(data_point)

        return jsonify({'data': formatted_data, 'info': info}), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/indicator', methods=['GET'])
def get_indicator_data():
    try:
        ticker_name = request.args.get('name')
        months = int(request.args.get('month', 1))
        indicator = request.args.get('indicator')

        if not ticker_name or not indicator:
            return jsonify({'error': 'Ticker name and indicator are required'}), 400

        end_date = datetime.now()
        start_date = end_date - timedelta(days=months * 30)

        ticker = yf.Ticker(ticker_name)
        hist = ticker.history(start=start_date, end=end_date)

        if hist.empty:
            return jsonify({'error': 'No historical data found'}), 404

        formatted_data = []

        if indicator == 'SMA':
            sma = hist['Close'].rolling(window=20).mean()
            for i in range(len(hist)):
                if pd.notnull(sma.iloc[i]):
                    formatted_data.append({
                        'Date': hist.index[i].strftime('%Y-%m-%d'),
                        'Close': float(hist['Close'].iloc[i]),
                        'SMA': float(sma.iloc[i])
                    })
        elif indicator == 'EMA':
            ema = hist['Close'].ewm(span=20, adjust=False).mean()
            for i in range(len(hist)):
                if pd.notnull(ema.iloc[i]):
                    formatted_data.append({
                        'Date': hist.index[i].strftime('%Y-%m-%d'),
                        'Close': float(hist['Close'].iloc[i]),
                        'EMA': float(ema.iloc[i])
                    })
        elif indicator == 'RSI':
            delta = hist['Close'].diff()
            gain = delta.where(delta > 0, 0).rolling(window=14).mean()
            loss = -delta.where(delta < 0, 0).rolling(window=14).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            for i in range(len(hist)):
                if pd.notnull(rsi.iloc[i]):
                    formatted_data.append({
                        'Date': hist.index[i].strftime('%Y-%m-%d'),
                        'Close': float(hist['Close'].iloc[i]),
                        'RSI': float(rsi.iloc[i])
                    })
        elif indicator == 'MACD':
            ema_12 = hist['Close'].ewm(span=12, adjust=False).mean()
            ema_26 = hist['Close'].ewm(span=26, adjust=False).mean()
            macd = ema_12 - ema_26
            signal = macd.ewm(span=9, adjust=False).mean()
            for i in range(len(hist)):
                if pd.notnull(macd.iloc[i]) and pd.notnull(signal.iloc[i]):
                    formatted_data.append({
                        'Date': hist.index[i].strftime('%Y-%m-%d'),
                        'MACD': float(macd.iloc[i]),
                        'Signal': float(signal.iloc[i])
                    })
        elif indicator == 'BB':
            sma = hist['Close'].rolling(window=20).mean()
            std = hist['Close'].rolling(window=20).std()
            upper = sma + 2 * std
            lower = sma - 2 * std
            for i in range(len(hist)):
                if pd.notnull(upper.iloc[i]) and pd.notnull(lower.iloc[i]):
                    formatted_data.append({
                        'Date': hist.index[i].strftime('%Y-%m-%d'),
                        'Close': float(hist['Close'].iloc[i]),
                        'Upper': float(upper.iloc[i]),
                        'Lower': float(lower.iloc[i])
                    })
        elif indicator == 'SO':
            low_14 = hist['Low'].rolling(window=14).min()
            high_14 = hist['High'].rolling(window=14).max()
            k = 100 * (hist['Close'] - low_14) / (high_14 - low_14)
            d = k.rolling(window=3).mean()
            for i in range(len(hist)):
                if pd.notnull(k.iloc[i]) and pd.notnull(d.iloc[i]):
                    formatted_data.append({
                        'Date': hist.index[i].strftime('%Y-%m-%d'),
                        'K': float(k.iloc[i]),
                        'D': float(d.iloc[i])
                    })
        elif indicator == 'ATR':
            tr1 = hist['High'] - hist['Low']
            tr2 = abs(hist['High'] - hist['Close'].shift())
            tr3 = abs(hist['Low'] - hist['Close'].shift())
            tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
            atr = tr.rolling(window=14).mean()
            for i in range(len(hist)):
                if pd.notnull(atr.iloc[i]):
                    formatted_data.append({
                        'Date': hist.index[i].strftime('%Y-%m-%d'),
                        'ATR': float(atr.iloc[i])
                    })
        elif indicator == 'IC':
            ic = (hist['High'] + hist['Low'] + hist['Close']) / 3
            for i in range(len(hist)):
                if pd.notnull(ic.iloc[i]):
                    formatted_data.append({
                        'Date': hist.index[i].strftime('%Y-%m-%d'),
                        'IC': float(ic.iloc[i])
                    })
        elif indicator == 'VWAP':
            tp = (hist['High'] + hist['Low'] + hist['Close']) / 3
            vwap = (tp * hist['Volume']).cumsum() / hist['Volume'].cumsum()
            for i in range(len(hist)):
                if pd.notnull(vwap.iloc[i]):
                    formatted_data.append({
                        'Date': hist.index[i].strftime('%Y-%m-%d'),
                        'VWAP': float(vwap.iloc[i])
                    })
        elif indicator == 'MFI':
            tp = (hist['High'] + hist['Low'] + hist['Close']) / 3
            raw_mf = tp * hist['Volume']
            change = tp.diff()
            pos_flow = (change.where(change > 0, 0) * hist['Volume']).rolling(window=14).sum()
            neg_flow = (-change.where(change < 0, 0) * hist['Volume']).rolling(window=14).sum()
            mfr = pos_flow / neg_flow
            mfi = 100 - (100 / (1 + mfr))
            for i in range(len(hist)):
                if pd.notnull(mfi.iloc[i]):
                    formatted_data.append({
                        'Date': hist.index[i].strftime('%Y-%m-%d'),
                        'MFI': float(mfi.iloc[i])
                    })
        else:
            return jsonify({'error': 'Invalid indicator'}), 400

        return jsonify({'data': formatted_data})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
