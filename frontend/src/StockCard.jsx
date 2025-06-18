import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const StockCard = ({ stock }) => {
  const priceChange = stock.Close - stock.Open;
  const percentageChange = (priceChange / stock.Open) * 100;
  const isUp = priceChange >= 0;

  return (
    <div className="bg-gradient-to-b from-neutral-900 via-black to-neutral-900 rounded-2xl p-5 text-white shadow-lg w-full max-w-xs">
      {/* Title */}
      <div className="mb-2">
        <h2 className="text-md text-nowrap overflow-hidden font-bold uppercase text-white">
          {stock.CompanyName}{" "}
          <span className="text-sm text-gray-400">({stock.symbol})</span>
        </h2>
        <p className="text-sm text-gray-400">{stock.Date}</p>
      </div>

      {/* Price and Change */}
      <div className="flex justify-between items-start flex-wrap mb-4 gap-2">
        {/* Current Price */}
        <div>
          <p className="text-sm text-gray-400">Current</p>
          <p className="text-3xl font-bold text-white">{stock.Close.toFixed(2)}</p>
        </div>

        {/* Price Change */}
        <div className="flex items-center gap-1 text-sm font-medium max-w-[120px] text-right">
          {isUp ? (
            <TrendingUp className="text-green-400 w-4 h-4" />
          ) : (
            <TrendingDown className="text-red-400 w-4 h-4" />
          )}
          <span className={isUp ? "text-green-400" : "text-red-400"} style={{ whiteSpace: "nowrap" }}>
            {priceChange >= 0 ? "+" : ""}
            {priceChange.toFixed(2)} ({percentageChange >= 0 ? "+" : ""}
            {percentageChange.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-300 mb-4">
        <div>
          <span className="text-gray-400">Open</span><br />
          <span className="text-white font-medium">{stock.Open.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-400">High</span><br />
          <span className="text-white font-medium">{stock.High.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-400">Low</span><br />
          <span className="text-white font-medium">{stock.Low.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-400">Volume</span><br />
          <span className="text-white font-medium">{stock.Volume}</span>
        </div>
      </div>

      {/* Daily Range */}
      <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-neutral-800 pt-2">
        <span className="text-lg">📊</span>
        Daily Trading Range:{" "}
        <span className="text-white font-medium">
          {(stock.High - stock.Low).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default StockCard;
