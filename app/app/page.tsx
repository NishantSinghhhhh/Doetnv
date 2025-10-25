import { Ad402Provider, Ad402Slot } from "../components/Ad402";
import Link from "next/link";

const Home = () => {
  return (
    <Ad402Provider publisherWallet="0x6d63C3DD44983CddEeA8cB2e730b82daE2E91E32">
      <main className="min-h-screen bg-white">
        {/* Hero Section - Cal.com style */}
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16">
          <div className="text-center mb-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full mb-8 border border-gray-200">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-gray-700 font-medium">The future of advertising</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
              SwiftAd Platform
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Decentralized advertising that pays publishers instantly. 
              No intermediaries. No waiting.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/blog" 
                className="bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition-all font-semibold text-lg shadow-sm"
              >
                View Demo Blog
              </Link>
              <Link 
                href="/dashboard" 
                className="bg-white text-gray-900 px-8 py-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all font-semibold text-lg"
              >
                Publisher Dashboard
              </Link>
            </div>
          </div>

          {/* Demo Ad Slots - Clean Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
            <div className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all shadow-sm hover:shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Header Banner</h3>
              </div>
              <Ad402Slot
                slotId="demo-header"
                size="banner"
                price="0.25"
                durations={['1h', '6h', '24h']}
                category="demo"
              />
            </div>
            
            <div className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all shadow-sm hover:shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Square Ad</h3>
              </div>
              <Ad402Slot
                slotId="demo-square"
                size="square"
                price="0.15"
                durations={['30m', '1h', '2h']}
                category="demo"
              />
            </div>
            
            <div className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all shadow-sm hover:shadow-md">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Mobile Banner</h3>
              </div>
              <Ad402Slot
                slotId="demo-mobile"
                size="mobile"
                price="0.10"
                durations={['1h', '6h', '12h']}
                category="demo"
              />
            </div>
          </div>

          {/* Features Section - Cal.com Grid */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Why choose SwiftAd?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Built for the modern web, powered by decentralized technology
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Instant Payments</h3>
                <p className="text-gray-600 leading-relaxed">
                  Publishers receive payments instantly using x402 protocol. No waiting periods or complex withdrawal processes.
                </p>
              </div>
              
              <div className="text-center p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/30">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">No Intermediaries</h3>
                <p className="text-gray-600 leading-relaxed">
                  Direct connection between publishers and advertisers. Lower fees, more transparency, better relationships.
                </p>
              </div>
              
              <div className="text-center p-8">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Real-time Analytics</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track views, clicks, and conversions in real-time. Get insights into your ad performance instantly.
                </p>
              </div>
            </div>
          </div>

          {/* How It Works - Timeline Style */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                How it works
              </h2>
              <p className="text-xl text-gray-600">
                Get started in minutes, not days
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                    1
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">Register Slots</h3>
                </div>
                <p className="text-gray-600 ml-16">
                  Publishers register ad slots on their websites with pricing and availability.
                </p>
              </div>
              
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                    2
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">Browse & Select</h3>
                </div>
                <p className="text-gray-600 ml-16">
                  Advertisers browse available slots and select the ones that fit their needs.
                </p>
              </div>
              
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                    3
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">Pay & Place</h3>
                </div>
                <p className="text-gray-600 ml-16">
                  Advertisers pay instantly using x402 and upload their ad content.
                </p>
              </div>
              
              <div className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0">
                    4
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900">Go Live</h3>
                </div>
                <p className="text-gray-600 ml-16">
                  Ads go live immediately and publishers start earning revenue.
                </p>
              </div>
            </div>
          </div>

          {/* Final CTA - Cal.com style */}
          <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-3xl p-12 md:p-16 text-center shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Join the decentralized advertising revolution today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/blog" 
                className="bg-white text-gray-900 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all font-semibold text-lg shadow-lg"
              >
                Try Demo
              </Link>
              <Link 
                href="/dashboard" 
                className="bg-transparent text-white px-8 py-4 rounded-lg border-2 border-white/30 hover:border-white/50 transition-all font-semibold text-lg"
              >
                Start Publishing
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-12 mt-24">
          <div className="max-w-6xl mx-auto px-6 text-center text-gray-600">
            <p className="text-sm">© 2025 SwiftAd. Built with ❤️ for the decentralized web.</p>
          </div>
        </footer>
      </main>
    </Ad402Provider>
  );
};

export default Home;