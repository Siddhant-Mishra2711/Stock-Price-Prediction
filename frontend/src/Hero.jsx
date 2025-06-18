import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Component() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#0b101e] to-black flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      
      {/* Subtle background pattern */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-[radial-gradient(#3b3d5a_1px,transparent_1px)] [background-size:18px_18px] opacity-20"></div>
      </div>

      {/* Sparkles icon */}
      <div className="relative z-10 mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 to-violet-600 blur-xl opacity-30 animate-ping"></div>
        <Sparkles className="relative h-12 w-12 text-cyan-300" />
      </div>

      {/* Heading */}
      <h1 className="relative z-10 text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-4">
        Welcome to{" "}
        <span className="text-5xl sm:text-6xl lg:text-7xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
          STX
        </span>
      </h1>

      {/* Subtitle */}
      <p className="relative z-10 text-lg sm:text-xl lg:text-2xl text-gray-300 max-w-3xl mb-10 leading-relaxed">
        Dive into the future of innovation with seamless digital experiences and futuristic design.
      </p>

      {/* Buttons */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          size="lg"
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-cyan-500/40 transition-all duration-300 transform hover:scale-105"
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="border-gray-600 text-gray-300 hover:bg-gray-900 hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300"
        >
          Learn More
        </Button>
      </div>

      {/* Animated dots */}
      <div className="relative z-10 mt-16 flex justify-center gap-2">
        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.1s]"></span>
        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
      </div>
    </div>
  );
}
