import { Ad402Provider, Ad402Slot } from '../../components/Ad402';

export default function BlogDemo() {
  return (
    <Ad402Provider publisherWallet="0x3c11A511598fFD31fE4f6E3BdABcC31D99C1bD10">
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12 relative">
          {/* Left Sidebar - Fixed */}
          <aside className="fixed left-8 top-1/2 transform -translate-y-1/2 hidden xl:block">
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
              <Ad402Slot
                slotId="sidebar-left"
                size="sidebar"
                price="0.20"
                durations={['1h', '6h', '24h']}
                category="technology"
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="max-w-3xl mx-auto">
            {/* Header Ad */}
            <div className="mb-12">
              <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <Ad402Slot
                  slotId="header-main"
                  size="banner"
                  price="0.25"
                  durations={['1h', '6h', '24h']}
                  category="technology"
                />
              </div>
            </div>

            <article className="prose prose-lg max-w-none">
              {/* Article Header */}
              <div className="mb-10">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                  The Future of Decentralized Advertising
                </h1>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-8">
                  <time className="font-medium">Dec 20, 2024</time>
                  <span>•</span>
                  <span>8 min read</span>
                  <span>•</span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-semibold">Technology</span>
                </div>
              </div>
              
              <p className="text-xl text-gray-700 leading-relaxed mb-8">
                Welcome to the future of web advertising where publishers get paid instantly and advertisers can place ads without intermediaries. 
                The Ad-402 platform revolutionizes digital advertising by leveraging x402 payments for seamless, decentralized ad placements.
              </p>
              
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Traditional advertising networks take significant cuts and have complex approval processes. With Ad-402, publishers can monetize 
                their content instantly, and advertisers can place ads directly using cryptocurrency payments.
              </p>
              
              {/* Mid-article ad */}
              <div className="my-12 flex justify-center">
                <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                  <Ad402Slot
                    slotId="mid-article"
                    size="square"
                    price="0.15"
                    durations={['30m', '1h', '2h']}
                    category="technology"
                  />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">How It Works</h2>
              
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                The Swift-Add Platform uses a simple but powerful mechanism:
              </p>
              
              <ol className="space-y-4 mb-10">
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-sm">1</span>
                  <span className="text-lg text-gray-700 leading-relaxed pt-1">Publishers register ad slots on their websites</span>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-sm">2</span>
                  <span className="text-lg text-gray-700 leading-relaxed pt-1">Advertisers browse available slots and place ads with instant payments</span>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-sm">3</span>
                  <span className="text-lg text-gray-700 leading-relaxed pt-1">Ads are displayed immediately after payment confirmation</span>
                </li>
                <li className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-sm">4</span>
                  <span className="text-lg text-gray-700 leading-relaxed pt-1">Publishers receive revenue instantly, minus a small platform fee</span>
                </li>
              </ol>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Benefits for Publishers</h2>
              
              <div className="bg-gray-50 rounded-2xl p-8 mb-10 border border-gray-100">
                <ul className="space-y-4">
                  <li className="flex gap-3 items-start">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg text-gray-700">Instant monetization of website traffic</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg text-gray-700">No complex approval processes</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg text-gray-700">Transparent pricing and revenue sharing</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg text-gray-700">Direct relationship with advertisers</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg text-gray-700">Global reach with cryptocurrency payments</span>
                  </li>
                </ul>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Benefits for Advertisers</h2>
              
              <div className="bg-gray-50 rounded-2xl p-8 mb-10 border border-gray-100">
                <ul className="space-y-4">
                  <li className="flex gap-3 items-start">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg text-gray-700">Direct ad placement without intermediaries</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg text-gray-700">Instant ad activation after payment</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg text-gray-700">Transparent pricing and placement</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg text-gray-700">Global reach and targeting options</span>
                  </li>
                  <li className="flex gap-3 items-start">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-lg text-gray-700">Real-time analytics and tracking</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 my-12 border border-blue-100">
                <p className="text-xl text-gray-900 leading-relaxed font-medium">
                  The Ad-402 platform represents a paradigm shift in digital advertising, moving away from centralized control 
                  to a decentralized, transparent, and efficient system that benefits both publishers and advertisers.
                </p>
              </div>
            </article>

            {/* Footer Ad */}
            <div className="mt-16 mb-12">
              <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                <Ad402Slot
                  slotId="footer-banner"
                  size="banner"
                  price="0.18"
                  durations={['2h', '6h', '12h']}
                  category="technology"
                />
              </div>
            </div>

          </div>

          {/* Right Sidebar - Fixed */}
          <aside className="fixed right-8 top-1/2 transform -translate-y-1/2 hidden xl:block">
            <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow">
              <Ad402Slot
                slotId="sidebar-right"
                size="sidebar"
                price="0.20"
                durations={['1h', '6h', '24h']}
                category="technology"
              />
            </div>
          </aside>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-12 mt-24">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-sm text-gray-600">© 2025 Ad-402. Built with ❤️ for the decentralized web.</p>
          </div>
        </footer>
      </div>
    </Ad402Provider>
  );
}