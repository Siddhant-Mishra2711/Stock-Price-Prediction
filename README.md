# Stock Price Prediction Project

This project uses Long Short-Term Memory (LSTM) neural networks to predict stock prices based on historical data. The model integrates technical indicators, such as moving averages and volatility, to generate buy/sell signals for decision support.

## Table of Contents

- [Project Structure](#project-structure)
- [Features](#features)
- [Requirements](#requirements)
- [Usage](#usage)
- [Results](#results)
- [License](#license)

## Project Structure

stock-price-prediction/ 
├── .gitignore 
├── LICENSE 
├── README.md 
├── requirements.txt 
├── data/ # Contains stock data files 
├── models/ # Saved models after training 
├── scripts/ # All code scripts
├── main.py # Main script for model training and evaluation
└── venv/ # Virtual environment (if applicable)

## Features

- **Data Download**: Automatically fetches historical stock data from Yahoo Finance.
- **Technical Indicators**: Computes moving averages and volatility to aid in model predictions.
- **LSTM Model**: Predicts stock prices using a neural network tailored for time-series forecasting.
- **Buy/Sell Signals**: Generates trading signals based on the model’s predictions compared to moving averages.
- **Evaluation**: Assesses model performance using Mean Squared Error (MSE) and Mean Absolute Error (MAE).

## Requirements

- Python 3.x
- Libraries: Install dependencies with `pip install -r requirements.txt`
  - numpy
  - pandas
  - matplotlib
  - scikit-learn
  - tensorflow / keras
  - yfinance

## Usage

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/stock-price-prediction.git
   cd stock-price-prediction

2. **Set up a virtual environment (optional but recommended)**:

    python or python3 -m venv venv
    source venv/bin/activate  # MacOS/Linux
    venv\Scripts\activate     # Windows

3. **Install the required libraries**:

    pip install -r requirements.txt

4. **Download Data and Train Model: Modify ticker, start_date, and end_date in scripts/main.py if needed, then run**:

    python scripts/main.py

5. **View Results**:
    
    The model will output predictions and generate buy/sell signals. Plots of actual vs. predicted prices with signals will display in a graphical window.

## Results

    The model provides a comparative analysis between actual and predicted stock prices and highlights potential buy/sell opportunities. Evaluation metrics (MSE and MAE) offer insights into the model's prediction accuracy.


## License

    This project is licensed under the MIT License. See the LICENSE file for more details.