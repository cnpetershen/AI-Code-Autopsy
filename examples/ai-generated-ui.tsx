/**
 * AI-Generated UI Example
 * This is a typical AI-generated landing page with common template patterns
 * Used for testing anti-ai-ui-runtime detection capabilities
 */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - AI Standard Pattern */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Build Amazing Products Faster
          </h1>
          <p className="text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Our platform helps teams ship better software with AI-powered tools
            and real-time collaboration features.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold shadow-lg hover:-translate-y-1 transition-all duration-300">
              Get Started Free
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm">
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section - 3-Column Grid (AI favorite) */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
            Powerful features to help your team succeed
          </p>

          <div className="grid grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Optimized for speed with sub-second response times and global CDN distribution.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure by Default</h3>
              <p className="text-gray-600">
                Enterprise-grade security with end-to-end encryption and SOC 2 compliance.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-lg p-6 hover:-translate-y-2 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="text-gray-600">
                Real-time collaboration with version control and team workspaces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Our Customers Say
          </h2>

          <div className="grid grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="ml-3">
                    <div className="font-semibold">User {i}</div>
                    <div className="text-sm text-gray-500">Company {i}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "This product has completely transformed how our team works.
                  We've seen a 3x improvement in productivity."
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-gray-600 text-center mb-12">
            Choose the plan that's right for you
          </p>

          <div className="grid grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-lg font-semibold mb-2">Basic</h3>
              <div className="text-4xl font-bold mb-6">$19<span className="text-lg text-gray-500">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">✓ 5 projects</li>
                <li className="flex items-center">✓ Basic analytics</li>
                <li className="flex items-center">✓ 48h support</li>
              </ul>
              <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold">
                Get Started
              </button>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
                Popular
              </div>
              <h3 className="text-lg font-semibold mb-2">Pro</h3>
              <div className="text-4xl font-bold mb-6">$49<span className="text-lg text-gray-500">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">✓ Unlimited projects</li>
                <li className="flex items-center">✓ Advanced analytics</li>
                <li className="flex items-center">✓ 24/7 support</li>
                <li className="flex items-center">✓ API access</li>
              </ul>
              <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg">
                Get Started
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-lg font-semibold mb-2">Enterprise</h3>
              <div className="text-4xl font-bold mb-6">$99<span className="text-lg text-gray-500">/mo</span></div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center">✓ Everything in Pro</li>
                <li className="flex items-center">✓ Custom integrations</li>
                <li className="flex items-center">✓ Dedicated support</li>
                <li className="flex items-center">✓ SLA guarantee</li>
              </ul>
              <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#">Features</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#">About</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API Reference</a></li>
                <li><a href="#">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
                <li><a href="#">Security</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
