import { motion, useTransform, useScroll } from "framer-motion";
import React, { useRef, useEffect, useState } from "react";
import { stockTickers } from "./constants/constants";
import StockCard from "./StockCard";

const Suggestion = () => {
  const [data, setData] = useState([]);

  const getData = async () => {
    let indexes = "^NSEI,^NSEBANK,";
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * stockTickers.length);
      indexes += stockTickers[randomIndex] + ",";
    }
    indexes = indexes.slice(0, -1);
    getData2(indexes);
  };

  const getData2 = async (ind) => {
    const response = await fetch(
      `http://localhost:5000/api/ml3?ind=${encodeURIComponent(ind)}`
    );
    const dataa = await response.json();
    setData(dataa.data);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="bg-gradient-to-b from-black via-blue-950 to-black min-h-screen text-white">
      <div className="text-center py-4 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-white drop-shadow-lg">
          🔍 Market Suggestions
        </h1>
        <p className="text-blue-300 text-lg md:text-xl max-w-2xl mx-auto">
          Curated insights powered by AI and data. Scroll to explore trending stocks.
        </p>
      </div>
      <HorizontalScrollCarousel data={data} />
    </div>
  );
};

const HorizontalScrollCarousel = ({ data }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  return (
    <section ref={targetRef} className="relative h-[220vh]">
      <div className="sticky top-0 flex h-[80vh] items-center overflow-hidden px-8">
        <motion.div style={{ x }} className="flex gap-8 py-10 px-4 md:px-16">
          {data.map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="rounded-2xl p-0 w-80 backdrop-blur-lg bg-gradient-to-br from-blue-900/30 to-black/30 border border-blue-800/40 shadow-[0_4px_30px_rgba(0,0,0,0.5)] hover:shadow-blue-500/40 transition-all duration-300"
            >
              <StockCard stock={card} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Suggestion;