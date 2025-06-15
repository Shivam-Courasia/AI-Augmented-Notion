
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Search, ArrowRight, Mic } from "lucide-react"
import Header from "@/components/Header"
import { Link } from "react-router-dom"

export default function NotionLanding() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between py-16 lg:py-24">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              The AI workspace
              <br />
              that works for you.
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              One place where teams find every answer,
              <br />
              automate the busywork, and get projects done.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/workspace">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  Get Notion free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-3">
                Request a demo
              </Button>
            </div>
          </div>

          {/* Character illustrations */}
          <div className="flex-1 flex justify-center lg:justify-end mt-12 lg:mt-0">
            <div className="flex items-center space-x-4">
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                <div className="text-6xl">👓</div>
              </div>
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center relative">
                <div className="text-6xl">🎧</div>
                <div className="absolute -right-2 -bottom-2 w-8 h-8 bg-blue-600 rounded-full"></div>
              </div>
              <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                <div className="text-6xl">😊</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trusted by section */}
        <div className="py-12 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-8 text-center">Trusted by top teams</p>
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60">
            <div className="text-lg font-semibold text-gray-800">OpenAI</div>
            <div className="text-lg font-semibold text-gray-800">Figma</div>
            <div className="text-lg font-semibold text-gray-800">VOLVO</div>
            <div className="text-lg font-semibold text-gray-800">ramp</div>
            <div className="text-lg font-semibold text-gray-800">CURSOR</div>
            <div className="text-lg font-semibold text-gray-800">headspace</div>
            <div className="text-lg font-semibold text-gray-800">perplexity</div>
            <div className="text-lg font-semibold text-gray-800">▲ Vercel</div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="py-16">
          <div className="grid md:grid-cols-2 gap-8">
            {/* AI Meeting Notes Card */}
            <Card className="p-8 bg-red-50 border-red-100 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center gap-2 mb-4">
                <Mic className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-gray-900">AI Meeting Notes</span>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">New</span>
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900">Perfect notes every time.</h3>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </Card>

            {/* Enterprise Search Card */}
            <Card className="p-8 bg-blue-50 border-blue-100 hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Enterprise Search</span>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">New</span>
              </div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">One search for everything.</h3>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-3 border">
                <Search className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Mobile team projects</span>
              </div>
            </Card>
          </div>
        </div>

        {/* Product Showcase Section */}
        <div className="py-16 bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Get started on Notion */}
            <Card className="p-6 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Get started on Notion</h3>
                  <p className="text-sm text-gray-500">Your AI workspace.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Link to="/workspace" className="block">
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Enter Workspace
                  </Button>
                </Link>
                <Button size="sm" variant="outline" className="w-full">
                  <span className="mr-2">🏪</span>
                  Download from the Store
                </Button>
              </div>
            </Card>

            {/* Notion Mail */}
            <Card className="p-6 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-2xl">✈️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Notion Mail</h3>
                  <p className="text-sm text-gray-500">The inbox that thinks like you.</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full">
                Download
              </Button>
            </Card>

            {/* Design System */}
            <Card className="p-6 bg-white">
              <div className="mb-4">
                <div className="w-full h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-3xl">🎨</div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Design system</h3>
                <p className="text-xs text-gray-500">
                  This design system provides guidelines, components, and tools to ensure consistency and efficiency in
                  digital product development.
                </p>
              </div>
            </Card>

            {/* Notion Calendar */}
            <Card className="p-6 bg-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-2xl">📅</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Notion Calendar</h3>
                  <p className="text-sm text-gray-500">Time and work, together.</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full mb-4">
                Download
              </Button>
              <div className="bg-gray-50 rounded p-3">
                <div className="text-xs text-gray-600 mb-2">Meeting with Stephanie Lee</div>
                <div className="grid grid-cols-7 gap-1 text-xs">
                  <div className="text-center p-1">S</div>
                  <div className="text-center p-1">M</div>
                  <div className="text-center p-1">T</div>
                  <div className="text-center p-1">W</div>
                  <div className="text-center p-1">T</div>
                  <div className="text-center p-1">F</div>
                  <div className="text-center p-1">S</div>
                  <div className="text-center p-1">1</div>
                  <div className="text-center p-1">2</div>
                  <div className="text-center p-1">3</div>
                  <div className="text-center p-1">4</div>
                  <div className="text-center p-1">5</div>
                  <div className="text-center p-1">6</div>
                  <div className="text-center p-1">7</div>
                  <div className="text-center p-1 bg-red-500 text-white rounded">8</div>
                  <div className="text-center p-1">9</div>
                  <div className="text-center p-1">10</div>
                  <div className="text-center p-1">11</div>
                  <div className="text-center p-1">12</div>
                  <div className="text-center p-1">13</div>
                  <div className="text-center p-1">14</div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                    <span className="text-white font-bold text-sm">N</span>
                  </div>
                </div>
                <div className="flex space-x-4 text-gray-400">
                  <span>𝕏</span>
                  <span>📧</span>
                  <span>💼</span>
                  <span>📘</span>
                  <span>📺</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>About us</li>
                  <li>Careers</li>
                  <li>Security</li>
                  <li>Status</li>
                  <li>Terms & privacy</li>
                  <li>Your privacy rights</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Download</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>iOS & Android</li>
                  <li>Mac & Windows</li>
                  <li>Calendar</li>
                  <li>Web Clipper</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Help center</li>
                  <li>Pricing</li>
                  <li>Blog</li>
                  <li>Community</li>
                  <li>Integrations</li>
                  <li>Templates</li>
                  <li>Affiliates</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Notion for</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>Enterprise</li>
                  <li>Small business</li>
                  <li>Personal</li>
                </ul>
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-900 mb-2">Explore more →</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                <span>🌐 English (US)</span>
                <span>Do Not Sell or Share My Info</span>
                <span>Cookie settings</span>
              </div>
              <div>© 2023 Notion Labs, Inc.</div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
