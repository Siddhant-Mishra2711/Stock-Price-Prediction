import React, { useState, useEffect } from 'react';
import StockSelector from './StockSelector';
import Sidebar from './Sidebar';
import { Button } from '@/components/ui/button';
import { MenuIcon, ChevronRight } from 'lucide-react';
import Candlechar from './Candlechar';
import News from './News';
import Strategy from './Strategy';

export default function All() {
  const [pastData, setPastData] = useState([]);
  const [alldata, setAlldata] = useState([]);
  const [month, setMonth] = useState(0);
  const [name, setName] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [newss, setNews] = useState([]);
  const [strategy, setStrategy] = useState(null);

  const datafound = async (data, data2) => {
    setPastData(data);
    setAlldata(data2);
  };

  const changemonth = async (month) => setMonth(month);
  const changename = async (name) => setName(name);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleStockSelection = (stock) => {
    setSelectedStock(stock);
    setSidebarOpen(true);
  };

  const getNews = async () => {
    const res = await fetch(`http://localhost:5000/api/news?tick=${selectedStock}`);
    const json = await res.json();
    setNews(json.data || []);
  };

  const getStrategy = async () => {
    const res = await fetch(`http://localhost:5000/api/strategy?tick=${selectedStock}&month=${month}&name=${name}`);
    const json = await res.json();
    setStrategy(json);
  };

  useEffect(() => {
    if (selectedStock !== null) {
      getNews();
      getStrategy();
    }
  }, [selectedStock]);

  return (
    <div id="analytics" className="flex min-h-screen bg-gradient-to-br from-indigo-100 via-sky-50 to-white">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur border-b shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-800">Stock Dashboard {selectedStock}</h1>
          <Button variant="outline" size="icon" onClick={toggleSidebar} className="md:hidden">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col md:flex-row">
          {/* Left Panel */}
          <div className={`flex-1 p-6 transition-all duration-300 ${sidebarOpen ? 'md:mr-64' : ''}`}>
            <div className="mb-6">
              <StockSelector data={datafound} month={changemonth} name={changename} onSelectStock={handleStockSelection} />
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              {selectedStock === null ? (
                <div className="w-full h-60 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">Graph Placeholder</p>
                </div>
              ) : (
                <div className="w-full">
                  <Candlechar past={pastData} month={month} name={name} />
                </div>
              )}
            </div>

            {/* Strategy + News */}
            <div className="mt-8 space-y-6">
              {strategy && <Strategy data={strategy} name={name} />}
              {/* Uncomment when news is needed */}
              {/* {newss && newss.length > 0 && <News data={newss} />} */}
            </div>
          </div>

          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} stockData={alldata} />
        </main>

        {/* Floating Sidebar Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className={`fixed bottom-4 right-4 z-50 ${!sidebarOpen && selectedStock ? 'md:flex' : 'hidden'}`}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
