import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";

const After = () => {
  return (
    <div className="bg-gradient-to-b from-black via-zinc-900 to-black text-white font-sans">
      <TextParallaxContent
        imgUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        subheading="Collaborate"
        heading="Built for all of us."
      >
        <ExampleContent />
      </TextParallaxContent>

      <TextParallaxContent2
        imgUrl="https://static.tradingview.com/static/bundles/lightweight-charts-video.avc1.d2a8feecfb879c75dea0.mp4"
        subheading="Quality"
        heading="Never compromise."
      >
        <ExampleContent />
      </TextParallaxContent2>

      <TextParallaxContent2
        imgUrl="https://static.tradingview.com/static/bundles/advanced-charts-video.hvc1.f5b72466040ec3823b64.mp4"
        subheading="Modern"
        heading="Dress for the best."
      >
        <ExampleContent />
      </TextParallaxContent2>
    </div>
  );
};

const IMG_PADDING = 12;

const TextParallaxContent = ({ imgUrl, subheading, heading, children }) => {
  return (
    <div style={{ paddingLeft: IMG_PADDING, paddingRight: IMG_PADDING }}>
      <div className="relative h-screen">
        <StickyImage imgUrl={imgUrl} />
        <OverlayCopy heading={heading} subheading={subheading} />
      </div>
      {children}
    </div>
  );
};

const TextParallaxContent2 = ({ imgUrl, subheading, heading, children }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <div style={{ paddingLeft: IMG_PADDING, paddingRight: IMG_PADDING }}>
      <div className="relative h-[80vh]">
        <motion.div
          style={{
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: `calc(100vh - ${IMG_PADDING * 2}px)`,
            top: IMG_PADDING,
            scale,
          }}
          ref={targetRef}
          className="sticky z-0 overflow-hidden rounded-3xl shadow-2xl"
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-3xl"
            style={{ opacity }}
          />
        </motion.div>

        <video
          className="absolute rounded-3xl top-0 left-0 w-full md:w-[80vw] h-[80vh] object-cover shadow-2xl"
          src={imgUrl}
          autoPlay
          loop
          muted
          playsInline
        />

        <OverlayCopy heading={heading} subheading={subheading} />
      </div>
      {children}
    </div>
  );
};

const StickyImage = ({ imgUrl }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["end end", "end start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <motion.div
      style={{
        backgroundImage: `url(${imgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: `calc(100vh - ${IMG_PADDING * 2}px)`,
        top: IMG_PADDING,
        scale,
      }}
      ref={targetRef}
      className="sticky z-0 overflow-hidden rounded-3xl shadow-2xl"
    >
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-3xl"
        style={{ opacity }}
      />
    </motion.div>
  );
};

const OverlayCopy = ({ subheading, heading }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [250, -250]);
  const opacity = useTransform(scrollYProgress, [0.25, 0.5, 0.75], [0, 1, 0]);

  return (
    <motion.div
      style={{ y, opacity }}
      ref={targetRef}
      className="absolute left-0 top-0 flex h-screen w-full flex-col items-center justify-center text-white backdrop-blur-sm bg-white/5 rounded-2xl px-4"
    >
      <p className="mb-2 text-center text-lg text-indigo-300 md:mb-4 md:text-3xl tracking-widest uppercase">
        {subheading}
      </p>
      <p className="text-center text-4xl font-extrabold md:text-7xl drop-shadow-2xl text-white">
        {heading}
      </p>
    </motion.div>
  );
};

const ExampleContent = () => (
  <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 pb-24 pt-16 md:grid-cols-12">
    <h2 className="col-span-1 text-4xl font-extrabold text-white md:col-span-4 leading-tight">
      Additional content explaining the above card here
    </h2>
    <div className="col-span-1 md:col-span-8 space-y-6">
      <p className="text-lg text-zinc-300 md:text-xl leading-relaxed">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi,
        blanditiis soluta eius quam modi aliquam quaerat odit deleniti minima
        maiores voluptate est ut saepe accusantium maxime doloremque nulla
        consectetur possimus.
      </p>
      <p className="text-lg text-zinc-300 md:text-xl leading-relaxed">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium
        reiciendis blanditiis aliquam aut fugit sint.
      </p>
      <button className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-3 text-lg font-medium text-white shadow-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105">
        Learn more <FiArrowUpRight />
      </button>
    </div>
  </div>
);

export default After;
