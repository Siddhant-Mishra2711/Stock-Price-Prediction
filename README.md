# 📈 STOCK_X: Stock Price Prediction Using LSTM

An intelligent stock market prediction and analytics platform that combines LSTM neural networks, real-time data integration, technical indicators, and modern web technologies to help users make data-driven trading decisions.

---

## 🚀 Project Overview

**STOCK_X** is a full-stack web application built to forecast stock prices and generate actionable insights using a Long Short-Term Memory (LSTM) deep learning model. It integrates a dual-backend system (Express.js + Flask), React.js frontend, MongoDB, and interactive charts to deliver an intuitive experience for investors and traders.

---

## 🧱 Project Structure

Stock-Price-Prediction/
├── backend/                    # Backend API (Node.js + Express)
│   ├── index.js                # Entry point for backend server
│   └── mongo_db/               # MongoDB config and collections (if applicable)
│   └── package.json            # Backend dependencies
│
├── frontend/                   # Frontend (React + Tailwind + MUI)
│   ├── src/                    # React source files
│   └── package.json            # Frontend dependencies
│
├── scripts/                    # Python ML Engine (Flask + LSTM)
│   └── main.py                 # LSTM orchestration script (data prep, train, predict)
│
├── data/                       # Historical stock data (.csv)
│
├── models/                     # Trained TensorFlow/Keras model files
│
├── requirements.txt            # Python dependency list (for Scripts)
│
└── README.md                   # Project documentation


## 🔧 Tech Stack

### 🖥️ Frontend
- **React.js**
- **Tailwind CSS** & **Material-UI**
- **Recharts / TradingView Charts**
- **Axios** for REST API communication

### ⚙️ Backend
- **Express.js** (Node.js) – handles APIs, news, routes
- **Flask** (Python) – ML processing and predictions
- **MongoDB** – stores historical and live market data
- **YFinance API** – real-time stock data retrieval

### 🧠 Machine Learning
- **LSTM (TensorFlow/Keras)** for time-series prediction
- **MinMaxScaler**, **train_test_split** from Scikit-learn
- Indicators: Moving Averages, RSI, MACD, Bollinger Bands, ATR

---

## 📥 Installation & Setup

### 1. Clone the Repository

```bash
1. git clone https://github.com/Siddhant-Mishra2711/Stock-Price-Prediction.git
cd Stock-Price-Prediction

2. Set Up Predictor (Flask ML API)
cd scripts/
python -m venv venv
source venv/bin/activate     # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py                # Starts Flask backend at http://localhost:5000

3. Set Up Backend (Node.js + Express & MongoDB)
cd backend/
npm install
node index.js                # Server running on port 3000

4. Set Up Frontend (React App)
cd frontend/
npm install
npm run dev                    # Runs frontend on (http://localhost:5173/)

⚙️ requirements.txt (Predictor)
Flask
flask-cors
yfinance
pandas
numpy
scikit-learn
tensorflow

Install with: pip install -r requirements.txt

▶️ Usage Instructions

Modify ticker symbol and date range in scripts/main.py or API params.

Start Flask + React apps, then open http://localhost:5000.

Explore dashboards, predictions, buy/sell signals, and technical indicators.

📊 Features

📈 LSTM-based stock forecasting

🔄 Real-time market data via Yahoo Finance

📉 Technical indicators (RSI, MACD, Bollinger Bands, etc.)

📊 Interactive dashboards and visualizations

📬 REST API for predictions and strategies

💡 Buy/sell signal generation

🔐 Scalable backend with MongoDB support

📌 Evaluation Metrics

MSE – Mean Squared Error

MAE – Mean Absolute Error

Visual plots of actual vs predicted prices with signal points

🔮 Future Roadmap

📰 News Sentiment Analysis using NLP

📳 Custom alerts based on user-defined thresholds

☁️ Cloud deployment with Docker + CI/CD

🤖 AI Chatbot for query-based forecasting and help

⏱️ Intraday predictions using higher-frequency data

📚 References

YFinance Docs

TensorFlow Documentation

React.js

MongoDB Docs

Research: Shen et al., "Stock market trend prediction using deep learning", Htun et al., 2023

👨‍💻 Authors

Siddhant Mishra

Aarti Kumari


Supervised by Dr. Tiya Dey Malakar & Dr. Ashoke Mondal
RCC Institute of Information Technology, Kolkata – 2025

## License

    This project is licensed under the MIT License. See the LICENSE file for more details.
