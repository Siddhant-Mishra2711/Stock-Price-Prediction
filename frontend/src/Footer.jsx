import {
  Twitter,
  Facebook,
  Youtube,
  Instagram,
  MessageCircle,
  Music,
  Github,
  Disc as Discord,
  Linkedin,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-indigo-900 to-black text-gray-300 py-16 px-4 md:px-8 lg:px-16 overflow-hidden">
      {/* Soft Glow Behind Branding */}
      <div className="absolute w-96 h-96 bg-cyan-500 blur-3xl opacity-10 rounded-full top-0 left-0 -z-10"></div>

      <div className="max-w-7xl text-2xl mx-auto space-y-14">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 border-b border-gray-700 pb-12">
          {/* Branding and Socials */}
          <div className="space-y-6">
            <div>
              <h2 className="text-white text-3xl font-bold tracking-tight">STX</h2>
              <p className="mt-2 text-sm text-indigo-300 italic">Look first / Then leap.</p>
            </div>

            {/* Social Icons */}
            <div className="grid grid-cols-3 gap-4">
              {[Twitter, Facebook, Youtube, Instagram, MessageCircle, Music, Github, Discord, Linkedin].map(
                (Icon, index) => (
                  <a
                    href="#"
                    key={index}
                    className="flex items-center justify-center w-10 h-10 rounded-full border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-200"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              )}
            </div>

            {/* Language Selector */}
            <div>
              <button className="flex items-center space-x-1 text-sm text-gray-400 hover:text-cyan-300 transition">
                <span>English (India)</span>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Link Columns */}
          {[
            {
              title: "Products",
              items: [
                "Supercharts",
                "Stock Screener",
                "ETF Screener",
                "Bond Screener",
                "Forex Screener",
                "Crypto Coins Screener",
              ],
            },
            {
              title: "Company",
              items: [
                "About",
                "Features",
                "Pricing",
                "Social network",
                "Wall of Love",
                "Athletes",
                "Manifesto",
                "Careers",
                "Blog",
              ],
            },
            {
              title: "Community",
              items: [
                "Refer a friend",
                "Ideas",
                "Scripts",
                "House rules",
                "Moderators",
                "Chat",
              ],
            },
          ].map((section, index) => (
            <div className="space-y-4" key={index}>
              <h3 className="text-white font-semibold text-lg tracking-wide">{section.title}</h3>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className={`text-sm transition-colors hover:text-cyan-300 ${
                        item === section.highlight ? "text-4xl text-cyan-400 font-medium"  : "text-gray-300"
                      }`}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="text-center text-sm text-gray-500 border-t border-gray-700 pt-6">
          © {new Date().getFullYear()}STX, Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
