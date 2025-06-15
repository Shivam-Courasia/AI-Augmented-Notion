
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function Header() {
  const [showNotionDropdown, setShowNotionDropdown] = useState(false)

  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-black text-white font-bold text-sm">
              N
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {/* Notion Dropdown */}
          <div
            className="relative group"
            onMouseEnter={() => setShowNotionDropdown(true)}
            onMouseLeave={() => setShowNotionDropdown(false)}
          >
            <div className="flex items-center space-x-1 cursor-pointer">
              <span className="text-sm font-medium text-gray-900">Notion</span>
              <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Dropdown Menu */}
            {showNotionDropdown && (
              <div className="absolute top-full left-0 mt-2 w-[800px] bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="grid grid-cols-3 gap-8 p-8">
                  {/* Features Column */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Features</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-base font-medium text-gray-900">Notion AI</h4>
                        <p className="text-sm text-gray-500">Build, write, automate</p>
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-gray-900">Docs</h4>
                        <p className="text-sm text-gray-500">Simple & powerful</p>
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-gray-900">Wikis</h4>
                        <p className="text-sm text-gray-500">Centralize your knowledge</p>
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-gray-900">Projects</h4>
                        <p className="text-sm text-gray-500">Manage any project</p>
                      </div>
                    </div>
                  </div>

                  {/* More Features Column */}
                  <div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-medium text-gray-900">Enterprise Search</h4>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">New</span>
                        </div>
                        <p className="text-sm text-gray-500">Find answers instantly</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-medium text-gray-900">AI Meeting Notes</h4>
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">New</span>
                        </div>
                        <p className="text-sm text-gray-500">Perfectly written by AI</p>
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-gray-900">Forms</h4>
                        <p className="text-sm text-gray-500">Responses and requests</p>
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-gray-900">Sites</h4>
                        <p className="text-sm text-gray-500">Publish anything, fast</p>
                      </div>
                    </div>
                  </div>

                  {/* Get Started Column */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Get started</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-base font-medium text-gray-900">Browse marketplace</h4>
                        <p className="text-sm text-gray-500">Templates for everything</p>
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-gray-900">View integrations</h4>
                        <p className="text-sm text-gray-500">Connect your apps with Notion</p>
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-gray-900">Download web clipper</h4>
                        <p className="text-sm text-gray-500">Save from the web into Notion</p>
                      </div>

                      {/* Desktop App Callout */}
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-2">
                              Try the Notion desktop app for a faster experience
                            </p>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                              Download app
                            </Button>
                          </div>
                          <div className="ml-4 w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                            <div className="text-2xl">👥</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <Link to="#" className="text-sm font-medium text-gray-900 hover:text-gray-700">
            Mail
            <span className="ml-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800">New</span>
          </Link>
          <Link to="#" className="text-sm font-medium text-gray-900 hover:text-gray-700">
            Calendar
          </Link>
          <Link to="#" className="text-sm font-medium text-gray-900 hover:text-gray-700">
            AI
          </Link>
          <Link to="#" className="text-sm font-medium text-gray-900 hover:text-gray-700">
            Enterprise
          </Link>
          <Link to="#" className="text-sm font-medium text-gray-900 hover:text-gray-700">
            Pricing
          </Link>
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium text-gray-900">Explore</span>
            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <Link to="#" className="text-sm font-medium text-gray-900 hover:text-gray-700">
            Request a demo
          </Link>
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center space-x-4">
          <Link to="#" className="text-sm font-medium text-gray-900 hover:text-gray-700">
            Log in
          </Link>
          <Link to="/workspace">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Get Notion free</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
