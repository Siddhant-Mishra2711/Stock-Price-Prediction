import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { FaSearch, FaCalendarAlt } from 'react-icons/fa';

export default function StockSelector({ onSelectStock, month, name, data }) {
  const [selectedStock, setSelectedStock] = useState('');
  const [months, setMonths] = useState('');
  const [dat, setData] = useState([]);

  useEffect(() => {
    const getData2 = async () => {
      const response = await fetch('http://localhost:3000/api/stocknameind');
      const dataa = await response.json();
      setData(dataa);
    };
    getData2();
  }, []);

  const handleChangeInvy = (e) => {
    setSelectedStock(e.target.value);
  };

  const getStockData = async () => {
    const isValid = dat.some((stock) => stock.Ticker === selectedStock);

    if (isValid) {
      month(months);
      name(selectedStock);
      const response = await axios.get('http://localhost:5000/api/ml2', {
        params: { name: selectedStock, month: months },
      });
      data(response.data.data, response.data.info);
    } else {
      alert('❌ Invalid Stock Name');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedStock) onSelectStock(selectedStock);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-5xl mx-auto mt-10 bg-gradient-to-br from-purple-100 via-white to-pink-100 border border-purple-200 rounded-3xl p-6 shadow-xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Stock Input with Icon */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500" />
          <input
            list="data"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-purple-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 font-medium"
            placeholder="Search stock ticker"
            name="Name"
            onChange={handleChangeInvy}
            value={selectedStock}
          />
          <datalist id="data">
            {dat.map((op, index) => (
              <option value={op.Ticker} key={index}>
                {op.Name}
              </option>
            ))}
          </datalist>
        </div>

        {/* Month Input with Icon */}
        <div className="relative">
          <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-500" />
          <Input
            type="number"
            placeholder="Enter months"
            value={months}
            onChange={(e) => setMonths(e.target.value)}
            className="pl-10 pr-4 py-3 rounded-xl border border-pink-300 text-gray-700 font-medium shadow-inner focus:ring-2 focus:ring-pink-400"
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          onClick={getStockData}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white text-lg font-bold rounded-xl shadow-lg transition duration-300 ease-in-out"
        >
          🚀 Search Stock
        </Button>
      </div>
    </form>
  );
}
