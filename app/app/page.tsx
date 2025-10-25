import { Ad402Provider, Ad402Slot } from "../components/Ad402";
import Link from "next/link";

const Home = () => {
  return (
    <Ad402Provider publisherWallet="0x6d63C3DD44983CddEeA8cB2e730b82daE2E91E32">
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-20">
            <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Ad-402 Platform
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              The future of decentralized advertising. Publishers get paid instantly, 
              advertisers place ads directly without intermediaries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/blog" 
                className="bg-gray-900 text-white px-8 py-3.5 rounded-lg hover:bg-gray-800 transition-all font-medium shadow-sm"
              >
                View Demo Blog
              </a>
              <a 
                href="/example-ads" 
                className="bg-white text-gray-900 px-8 py-3.5 rounded-lg border border-gray-300 hover:border-gray-400 transition-all font-medium"
              >
                See Ad Examples
              </a>
              <a 
                href="/dashboard" 
                className="bg-white text-gray-900 px-8 py-3.5 rounded-lg border border-gray-300 hover:border-gray-400 transition-all font-medium"
              >
                Publisher Dashboard
              </a>
            </div>
          </div>

          {/* Demo Ad Slots */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Header Banner</h3>
              <Ad402Slot
                slotId="demo-header"
                size="banner"
                price="0.25"
                durations={['1h', '6h', '24h']}
                category="demo"
              />
            </div>
            
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Square Ad</h3>
              <Ad402Slot
                slotId="demo-square"
                size="square"
                price="0.15"
                durations={['30m', '1h', '2h']}
                category="demo"
              />
            </div>
            
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Mobile Banner</h3>
              <Ad402Slot
                slotId="demo-mobile"
                size="mobile"
                price="0.10"
                durations={['1h', '6h', '12h']}
                category="demo"
              />
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Instant Payments</h3>
              <p className="text-gray-600 leading-relaxed">
                Publishers receive payments instantly using x402 protocol. No waiting periods or complex withdrawal processes.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">No Intermediaries</h3>
              <p className="text-gray-600 leading-relaxed">
                Direct connection between publishers and advertisers. Lower fees, more transparency, better relationships.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 border border-gray-200">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 4 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">Real-time Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Track views, clicks, and conversions in real-time. Get insights into your ad performance instantly.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 mb-20">
            <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-gray-900 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2 text-gray-900">Register Slots</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Publishers register ad slots on their websites with pricing and availability.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gray-900 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2 text-gray-900">Browse & Select</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Advertisers browse available slots and select the ones that fit their needs.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gray-900 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2 text-gray-900">Pay & Place</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Advertisers pay instantly using x402 and upload their ad content.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gray-900 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h3 className="font-semibold mb-2 text-gray-900">Go Live</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Ads go live immediately and publishers start earning revenue.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gray-900 text-white p-16 rounded-2xl border border-gray-800 shadow-lg">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-10 opacity-90">
              Join the decentralized advertising revolution today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/blog" 
                className="bg-white text-gray-900 px-8 py-3.5 rounded-lg hover:bg-gray-100 transition-all font-medium border border-gray-300"
              >
                Try Demo
              </a>
              <a 
                href="/dashboard" 
                className="bg-gray-800 text-white px-8 py-3.5 rounded-lg hover:bg-gray-700 transition-all font-medium border border-gray-700"
              >
                Start Publishing
              </a>
            </div>
          </div>
        </div>
      </main>
    </Ad402Provider>
  );
};

export default Home;





















