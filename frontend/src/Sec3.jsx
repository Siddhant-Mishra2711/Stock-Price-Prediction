import React from "react";
import { motion } from "framer-motion";
import { Rocket, Code, Layers, Zap } from "lucide-react";

export const Sec3 = () => {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-4 py-24 text-white">
      {/* Glow Effects */}
      <div className="pointer-events-none absolute -top-32 left-0 z-0 h-96 w-96 rounded-full bg-indigo-500 opacity-20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 z-0 h-80 w-80 rounded-full bg-pink-500 opacity-20 blur-[100px]" />

      {/* Heading + CTA */}
      <div className="relative mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            Elevate your business with our{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
              next-gen solutions
            </span>
          </h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:shadow-xl hover:brightness-110"
        >
          Discover More
        </motion.button>
      </div>

      {/* Cards Grid */}
      <div className="relative grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 z-10">
        <EnhancedCard
          icon={<Rocket size={28} />}
          title="Launch Ideas"
          desc="Transform concepts into reality with rapid MVP delivery."
          color="from-indigo-500 to-blue-500"
        />
        <EnhancedCard
          icon={<Code size={28} />}
          title="Build Seamlessly"
          desc="Clean code, smooth dev experience, and reliable systems."
          color="from-green-400 to-emerald-500"
        />
        <EnhancedCard
          icon={<Layers size={28} />}
          title="Scale Efficiently"
          desc="Built for growth — we help you handle 10x load with ease."
          color="from-yellow-400 to-amber-500"
        />
        <EnhancedCard
          icon={<Zap size={28} />}
          title="Boost Performance"
          desc="Lightweight, optimized, and blazing fast by design."
          color="from-pink-500 to-rose-500"
        />
      </div>
    </section>
  );
};

const EnhancedCard = ({ icon, title, desc, color }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 transition-all duration-300 backdrop-blur-xl shadow-md hover:shadow-2xl"
    >
      {/* Icon Container */}
      <div
        className={`relative z-10 mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${color} text-white shadow-lg transition-transform duration-300 group-hover:rotate-6`}
      >
        {icon}
      </div>

      {/* Title and Description */}
      <h3 className="text-xl font-semibold tracking-wide">{title}</h3>
      <p className="mt-2 text-sm text-slate-300 leading-relaxed">{desc}</p>

      {/* Hover Glow */}
      <div
        className={`absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br ${color} opacity-0 transition duration-500 group-hover:opacity-10 blur-2xl`}
      />
    </motion.div>
  );
};

export default Sec3;
