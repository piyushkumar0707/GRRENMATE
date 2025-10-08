import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Leaf, 
  Menu, 
  X, 
  Camera, 
  Home, 
  User, 
  Settings,
  LogOut,
  Bell
} from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // Replace with actual auth state
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Recognize', href: '/recognize', icon: Camera },
    { name: 'Dashboard', href: '/dashboard', icon: User },
  ]

  const userMenuItems = [
    { name: 'Profile', icon: User, href: '/profile' },
    { name: 'Settings', icon: Settings, href: '/settings' },
    { name: 'Notifications', icon: Bell, href: '/notifications' },
    { name: 'Sign Out', icon: LogOut, href: '#', action: 'logout' },
  ]

  return (
    <>
      <nav className={`navbar-glass transition-all duration-300 ${
        scrolled ? 'py-4 bg-white/90' : 'py-6 bg-white/60'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 group-hover:scale-110 transition-transform duration-300">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold gradient-text">
                GreenMate
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-2xl font-medium transition-all duration-300 ${
                      isActive 
                        ? 'text-primary-600 bg-primary-50' 
                        : 'text-gray-600 hover:text-primary-600 hover:bg-white/60'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary-100 rounded-2xl -z-10"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="relative">
                  <button 
                    className="flex items-center space-x-2 p-2 rounded-2xl hover:bg-white/60 transition-all duration-300"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-200"
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 glass-card py-2 z-50"
                      >
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-white/60 transition-colors duration-200"
                            onClick={() => {
                              setIsOpen(false)
                              if (item.action === 'logout') {
                                setIsLoggedIn(false)
                              }
                            }}
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setIsLoggedIn(true)}
                    className="text-gray-600 hover:text-primary-600 px-4 py-2 rounded-2xl font-medium transition-colors duration-300"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={() => setIsLoggedIn(true)}
                    className="btn-primary"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-2xl hover:bg-white/60 transition-colors duration-300"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: 180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 180, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6 text-gray-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: -180, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -180, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6 text-gray-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-80 glass-card z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Mobile Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600">
                      <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-display font-bold gradient-text">
                      GreenMate
                    </span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl hover:bg-white/60"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Mobile Navigation */}
                <nav className="space-y-2 mb-8">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-2xl font-medium transition-all duration-300 ${
                          isActive 
                            ? 'text-primary-600 bg-primary-50' 
                            : 'text-gray-600 hover:text-primary-600 hover:bg-white/60'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </nav>

                {/* Mobile Actions */}
                {isLoggedIn ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 p-4 bg-white/60 rounded-2xl mb-4">
                      <img
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-200"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">John Doe</div>
                        <div className="text-sm text-gray-500">john@example.com</div>
                      </div>
                    </div>
                    
                    {userMenuItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => {
                          setIsOpen(false)
                          if (item.action === 'logout') {
                            setIsLoggedIn(false)
                          }
                        }}
                        className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-white/60 rounded-2xl transition-colors duration-200"
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        setIsLoggedIn(true)
                        setIsOpen(false)
                      }}
                      className="w-full btn-secondary text-center"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => {
                        setIsLoggedIn(true)
                        setIsOpen(false)
                      }}
                      className="w-full btn-primary text-center"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar