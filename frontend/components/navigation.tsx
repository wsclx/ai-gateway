'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Bot, 
  BarChart3, 
  Settings, 
  SlidersHorizontal, 
  LogIn, 
  Palette
} from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }, [isMobileMenuOpen])

  return (
    <>
      {/* Top Header - Always visible */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-3">
                <Bot className="w-8 h-8 text-primary" />
                <h1 className="text-xl font-bold">AI Gateway</h1>
              </div>
              <p className="text-sm text-muted-foreground hidden md:block">
                Professionelles Intranet-AI-Gateway
              </p>
            </div>

            {/* Login Button */}
            <div className="flex items-center space-x-4">
              <a
                href="/api/v1/auth/ms/login"
                className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Microsoft Login</span>
              </a>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 rounded-md hover:bg-muted"
                aria-label="Toggle mobile menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-end mb-6">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md hover:bg-muted"
                aria-label="Close mobile menu"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <nav className="space-y-2">
              <Link
                href="/"
                onClick={toggleMobileMenu}
                className="flex items-center gap-3 p-4 rounded-lg text-lg transition-colors hover:bg-muted text-foreground"
              >
                <Bot className="h-6 w-6" />
                Chat
              </Link>
              <Link
                href="/branding"
                onClick={toggleMobileMenu}
                className="flex items-center gap-3 p-4 rounded-lg text-lg transition-colors hover:bg-muted text-foreground"
              >
                <Palette className="h-6 w-6" />
                Branding
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
