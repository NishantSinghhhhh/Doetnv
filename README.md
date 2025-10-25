🚀 SwiftAd - Web3 Advertising InfrastructureA next-generation advertising platform leveraging blockchain technology, distributed storage, and dynamic bidding mechanisms for trustless, decentralized ad management.🎯 Platform OverviewSwiftAd represents a fully decentralized advertising infrastructure that transforms the relationship between content creators and brands. Engineered for the Web3 landscape, it delivers:🔗 On-Chain Payments: Trustless USDC settlements using EIP-3009 protocol🌐 Distributed Storage: Permanent, censorship-resistant hosting via IPFS⚡ Dynamic Auction System: Market-driven pricing for premium ad inventory📱 Contemporary Interface: Sleek, adaptive design with native Web3 support🛠️ Integration SDK: Plug-and-play solution for any digital property🏆 Project HighlightsBuilt as a comprehensive Web3 advertising infrastructure showcasing:End-to-end implementation using Next.js and TypeScriptSmart contract integration with USDC payment rails and wallet connectivityDistributed storage architecture powered by IPFS and LighthouseLive production environment hosted on VercelPublisher-ready SDK enabling seamless integration🏗️ System Architecture<img width="639" height="384" alt="SS 2025-09-28 at 09 02 25" src="https://github.com/user-attachments/assets/b8a9e991-52d9-40cd-a9f7-d59bdc2efb5e" />┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client        │    │   Settlement    │    │   Repository    │
│   (Next.js)     │◄──►│   (X402/USDC)   │◄──►│   (IPFS/LH)     │
│   Interface     │    │   On-Chain      │    │   Distributed   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SwiftAd SDK   │    │   Endpoints     │    │   Auction Pool  │
│   Publisher Kit │    │   Serverless    │    │   Bid Manager   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
📁 Repository Layoutmono-repo/
├── 🎨 app/                          # Core Next.js Platform
│   ├── app/                         # App Router Structure
│   │   ├── api/                     # Backend API Layer
│   │   │   ├── ads/[slotId]/        # Ad serving & retrieval
│   │   │   ├── upload-ad/           # Content upload handler
│   │   │   ├── queue-info/[slotId]/ # Auction queue control
│   │   │   ├── analytics/           # Performance monitoring
│   │   │   └── test-expiration/     # Development utilities
│   │   ├── checkout/                # Transaction & bidding UI
│   │   ├── upload/                  # Content submission portal
│   │   ├── dashboard/               # Creator metrics panel
│   │   └── example-ads/             # Live demonstration slots
│   ├── components/                  # UI Building Blocks
│   │   ├── SwiftAdSlot.tsx          # Primary slot renderer
│   │   ├── AdSlot.tsx               # Secondary slot variant
│   │   ├── WalletConnectModal.tsx   # Web3 wallet bridge
│   │   └── ui/                      # Component primitives
│   ├── lib/                         # Business Logic
│   │   ├── lighthouse.ts            # Distributed storage layer
│   │   ├── adService.ts             # Ad lifecycle management
│   │   ├── usdc.ts                  # Payment processing
│   │   └── walletConnect.ts         # Wallet orchestration
│   └── types/                       # Type definitions
├── 📦 swiftad-sdk/                  # Publisher Integration Kit
│   ├── src/                         # SDK Implementation
│   │   ├── components/              # Exportable components
│   │   │   ├── SwiftAdProvider.tsx  # Configuration provider
│   │   │   └── SwiftAdSlot.tsx      # Slot implementation
│   │   ├── types/                   # Interface definitions
│   │   └── utils/                   # Helper functions
│   ├── examples/                    # Usage demonstrations
│   │   ├── basic-usage.tsx          # Minimal setup
│   │   └── nextjs-example.tsx       # Framework integration
│   └── dist/                        # Compiled distribution
├── ⚡ mainnet-facilitator/          # Payment Processor
│   └── index.ts                     # Settlement orchestrator
└── 🔧 service/                      # Supporting Services
    ├── src/                         # Implementation code
    └── routes/                      # Endpoint definitions
🔗 Platform AccessLive Platform: https://swiftad.ioNPM Package: npmjs.com/package/swiftad-sdk🚀 Core Capabilities💰 Settlement InfrastructureUSDC Integration: Standards-compliant token transfers via EIP-3009X402 Framework: Optimized for micropayment workflowsUniversal Wallet Support: Compatible with MetaMask, WalletConnect, and alternativesPolygon Settlement Layer: Minimal fees, instant finality🎯 Inventory ManagementStandard Formats: Banner (728x90), Square (300x250), Mobile (320x60), Sidebar (160x600)Vertical Targeting: Technology, General, and Demo classificationsLive Availability: Real-time occupancy and expiration trackingLifecycle Automation: Time-bound ad rotation management⚡ Auction MechanismOpen Inventory: Instant acquisition at floor priceOccupied Positions: Competitive bidding for upcoming slotsPriority Queue: Top bids secure next-available placementSeamless Transitions: Automatic activation upon slot expiration🌐 Storage InfrastructureIPFS Foundation: All creative assets hosted on decentralized networkPermanent Availability: Content persists beyond server lifecyclesGeographic Distribution: Worldwide delivery via IPFS nodesPerformance Optimization: 30-second caching layer📦 Publisher SDKThe SwiftAd SDK enables effortless integration of decentralized advertising across any web property:🎯 Rapid Setup// 1. Add SDK dependency
npm install swiftad-sdk

// 2. Configure your application
import { SwiftAdProvider } from 'swiftad-sdk';

export default function RootLayout({ children }) {
  return (
    <SwiftAdProvider
      config={{
        websiteId: 'your-website-id',
        walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        apiBaseUrl: '[https://swiftad.io](https://swiftad.io)',
      }}
    >
      {children}
    </SwiftAdProvider>
  );
}

// 3. Deploy ad inventory across your site
import { SwiftAdSlot } from 'swiftad-sdk';

export default function HomePage() {
  return (
    <div>
      <h1>Welcome to My Website</h1>
      
      {/* Top banner placement */}
      <SwiftAdSlot
        slotId="header-banner"
        size="banner"
        price="0.25"
        category="technology"
      />
      
      <main>
        <p>Your content here...</p>
      </main>
      
      {/* Vertical sidebar unit */}
      <SwiftAdSlot
        slotId="sidebar-ad"
        size="sidebar"
        price="0.15"
        category="general"
      />
    </div>
  );
}
🎨 Extended Configurationconst advancedConfig = {
  websiteId: 'your-website-id',
  walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  apiBaseUrl: '[https://swiftad.io](https://swiftad.io)',
  theme: {
    primaryColor: '#1a1a1a',
    backgroundColor: '#f8f9fa',
    textColor: '#333333',
    borderColor: '#dee2e6',
    fontFamily: 'Inter, sans-serif',
    borderRadius: 8
  },
  payment: {
    networks: ['polygon', 'ethereum'],
    defaultNetwork: 'polygon',
    recipientAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  },
  defaultSlotConfig: {
    durations: ['1h', '6h', '24h', '7d'],
    clickable: true
  }
};
🔧 Supported Slot DimensionsFormatDimensionsOptimal Placementbanner728x90pxPage headers, footerssquare300x250pxContent sidebars, inline unitsmobile320x60pxMobile-optimized layoutssidebar160x600pxLong-form vertical spaces🛠️ Technical Foundation🔗 Blockchain LayerEIP-3009 Compliance: Secure, auditable USDC movementsX402 Standard: Purpose-built for ad micropaymentsPolygon Infrastructure: Sub-second confirmations, negligible gasWeb3 Compatibility: Universal wallet integration layer🌐 Storage DesignLighthouse/IPFS Core: Censorship-resistant content deliveryHTTP Transport: Zero native dependencies, pure web standardsDeployment Resilience: Data survives function cold startsEdge Distribution: Content served from nearest IPFS gateway⚡ API InterfaceGET /api/ads/[slotId] - Fetch current ad for inventory slotPOST /api/upload-ad - Submit new advertising creativeGET /api/queue-info/[slotId] - Retrieve auction queue statePOST /api/analytics/ad-view - Log impression eventsPOST /api/analytics/ad-click - Record engagement metricsGET /api/health - Platform status verification🚀 Launch Guide📋 RequirementsNode.js 18 or higherLighthouse.storage credentialsWeb3-enabled wallet (MetaMask recommended)USDC balance on Polygon network🔧 Development Environment# Clone source repository
git clone [https://github.com/swiftad/mono-repo.git](https://github.com/swiftad/mono-repo.git)
cd mono-repo

# Install project dependencies
cd app
npm install

# Configure environment
cp .env.example .env.local
# Insert your LIGHTHOUSE_API_KEY

# Launch development server
npm run dev
📦 SDK Development Workflow# Access SDK workspace
cd swiftad-sdk

# Install dependencies
npm install

# Compile SDK package
npm run build

# Enable hot reload for development
npm run dev
🌐 Production DeploymentVercel Hosting (Primary Method)Repository Connection: Link GitHub repository to Vercel dashboardEnvironment Configuration:LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here
Automatic Deployment: Vercel detects Next.js configuration and buildsValidation: Confirm ad lifecycle and data persistence functionalityRequired Environment Variables# Production essentials
LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here

# Optional - for data migration
LIGHTHOUSE_STORAGE_HASH=your_existing_ipfs_hash
🎨 Design System🎯 Visual PhilosophyContemporary Minimalism: Refined, professional aestheticMonospace Typeface: JetBrains Mono for technical precisionGeometric Styling: Angular edges for crisp, modern appearanceAchromatic Scheme: High-contrast black, white, and gray foundationAdaptive Layout: Fluid responsiveness across all viewport sizes🧩 Component LibrarySwiftAdSlot: Primary inventory unit with integrated biddingCheckout Interface: Streamlined payment and auction workflowUpload Portal: Intuitive creative submission with progress indicatorsAnalytics Dashboard: Publisher performance and revenue insights🔒 Security ArchitectureOn-Chain Settlements: Immutable payment audit trail via blockchainDistributed Hosting: Decentralized storage eliminates central vulnerabilitiesCryptographic Authentication: Web3 wallet-based identity verificationRequest Throttling: API rate limiting prevents resource exhaustionSchema Validation: Comprehensive input sanitization and type checkingOrigin Controls: Properly configured CORS policies📊 ObservabilityEngagement Metrics: Click-through rates and impression trackingRevenue Intelligence: Payment volume and bidding analyticsAuction Performance: Queue depth and bid distribution monitoringStorage Telemetry: IPFS node health and retrieval latencyLive Status: Real-time inventory availability and queue updates🧪 Quality Assurance🎯 Testing Endpoints/api/test-expiration - Generate test ads with configurable TTL/example-ads - Interactive showcase of all slot formats/test-ads - Development sandbox environment🔍 Validation ScenariosCreative Upload: Content submission and rendering pipelineAuction Dynamics: Queue prioritization and bid processingLifecycle Management: Automatic expiration and rotation validationData Durability: Persistence across deployment cyclesTransaction Flow: End-to-end USDC payment verification🌟 Production Characteristics⚡ Horizontal ScalabilityServerless Foundation: Elastic scaling via Vercel infrastructureDistributed Delivery: Global IPFS content replicationIntelligent Caching: 30-second TTL for optimal performanceEfficient Queuing: Low-latency auction state management🛡️ System ReliabilityDecentralized Architecture: No single point of failureGraceful Degradation: Comprehensive error recovery mechanismsStateful Persistence: Data survives infrastructure changesEvent-Driven Updates: Reactive inventory and queue synchronization📈 RoadmapCross-Chain Expansion: Ethereum mainnet, Arbitrum, Optimism supportEnhanced Analytics: Granular performance attribution and funnel analysisCreative Optimization: Multivariate testing frameworkNative Applications: iOS and Android mobile clientsEcosystem Integration: Third-party marketplace and API connectorsIntelligent Targeting: Machine learning-powered placement optimizationNFT Experiences: Tokenized ad units and collectible campaigns🤝 Contribution GuidelinesWe encourage community participation! Here's your pathway to contributing:Fork Repository: Create your own branch of the codebaseFeature Branch: git checkout -b feature/innovative-enhancementImplementation: Adhere to established patterns and conventionsQuality Assurance: Validate all functionality with comprehensive testsPull Request: Submit with detailed description of modifications🎯 Coding StandardsTypeScript mandatory for all new implementationsMaintain consistency with existing style patternsInclude test coverage for new capabilitiesKeep documentation synchronized with code changesVerify mobile and responsive behavior📄 LicenseReleased under the MIT License - refer to LICENSE file for complete terms.🎉 Start Building TodayContent Creators: Integrate the SwiftAd SDK and begin monetizing your digital properties within minutes.Advertisers: Acquire premium inventory with USDC and connect with engaged audiences through our trustless platform.Developers: Extend our open-source infrastructure and shape the evolution of decentralized advertising.SwiftAd - Transforming digital advertising through decentralization and cryptographic trust. 🚀Crafted with ❤️ for the Web3 ecosystem