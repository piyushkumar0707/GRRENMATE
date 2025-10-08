'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, Send, Bot, User, Leaf, Sparkles, Camera, 
  Heart, Droplets, Sun, Wind, Bug, Scissors, ShoppingBag,
  BookOpen, Calendar, MapPin, ThermometerSun
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
  suggestions?: string[]
}

const quickSuggestions = [
  { icon: <Leaf className="h-4 w-4" />, text: "Identify my plant", category: "recognition" },
  { icon: <Droplets className="h-4 w-4" />, text: "Watering schedule", category: "care" },
  { icon: <Bug className="h-4 w-4" />, text: "Plant diseases", category: "health" },
  { icon: <Sun className="h-4 w-4" />, text: "Light requirements", category: "care" },
  { icon: <Scissors className="h-4 w-4" />, text: "Pruning tips", category: "maintenance" },
  { icon: <ShoppingBag className="h-4 w-4" />, text: "Where to buy plants", category: "shopping" }
]

const plantPersonalities = [
  { name: "Dr. Green", specialty: "Plant Health Expert", avatar: "🌿", color: "emerald" },
  { name: "Sunny", specialty: "Succulent Specialist", avatar: "🌵", color: "yellow" },
  { name: "Ivy", specialty: "Indoor Plant Guru", avatar: "🍃", color: "green" },
  { name: "Rose", specialty: "Garden Designer", avatar: "🌹", color: "rose" }
]

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! 🌱 I'm your AI Plant Care Assistant. I can help you identify plants, diagnose problems, suggest care routines, and answer any plant-related questions. What would you like to know?",
      timestamp: new Date(),
      suggestions: [
        "Help me identify a plant from a photo",
        "My plant leaves are turning yellow",
        "Create a watering schedule",
        "Suggest plants for beginners"
      ]
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [selectedBot, setSelectedBot] = useState(plantPersonalities[0])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    // Plant identification
    if (lowerMessage.includes('identify') || lowerMessage.includes('what plant')) {
      return `I'd love to help identify your plant! 📸 You can upload a photo using our Plant Recognition feature, or describe the plant to me. What does it look like? Consider:\n\n• Leaf shape and size\n• Flower color (if any)\n• Growth pattern (tall, bushy, climbing)\n• Where you found it\n\nI can provide identification with 95% accuracy!`
    }
    
    // Watering issues
    if (lowerMessage.includes('water') || lowerMessage.includes('yellow leaves')) {
      return `Yellow leaves often indicate watering issues! 💧 Here's my diagnosis:\n\n**Overwatering signs:**\n• Yellow leaves with brown spots\n• Musty soil smell\n• Soft, mushy stems\n\n**Underwatering signs:**\n• Yellow leaves that feel dry\n• Soil pulling away from pot\n• Drooping despite dry soil\n\n**Quick fix:** Check soil moisture 2 inches down. Most plants need water when topsoil is dry. Would you like a personalized watering schedule?`
    }
    
    // Plant care
    if (lowerMessage.includes('care') || lowerMessage.includes('schedule')) {
      return `I'll create the perfect care routine for your plants! 📅 Here's a basic schedule:\n\n**Weekly Tasks:**\n• Monday: Check soil moisture\n• Wednesday: Rotate plants for even light\n• Friday: Check for pests\n• Sunday: Mist humidity-loving plants\n\n**Monthly Tasks:**\n• Fertilize (growing season)\n• Prune dead/yellowing leaves\n• Clean leaves with damp cloth\n\nWhat specific plants do you have? I can customize this schedule!`
    }
    
    // Disease/pest issues
    if (lowerMessage.includes('disease') || lowerMessage.includes('pest') || lowerMessage.includes('bug') || lowerMessage.includes('spots')) {
      return `Let me help diagnose your plant's health issues! 🔍 Common problems I see:\n\n**Fungal Issues:**\n• Brown/black spots on leaves\n• White powdery coating\n• Leaf drop\n\n**Pest Problems:**\n• Small flying insects (fungus gnats)\n• Sticky honeydew (aphids)\n• Fine webbing (spider mites)\n\n**Solutions:**\n• Improve air circulation\n• Adjust watering frequency\n• Use neem oil for pests\n• Remove affected leaves\n\nCan you describe what you're seeing? I can provide specific treatment recommendations!`
    }
    
    // Light requirements
    if (lowerMessage.includes('light') || lowerMessage.includes('sun')) {
      return `Lighting is crucial for plant health! ☀️ Here's my guide:\n\n**Bright Direct Light:** (6+ hours sun)\n• Succulents, cacti\n• Herbs like basil, rosemary\n• Most flowering plants\n\n**Bright Indirect Light:** (bright but filtered)\n• Monstera, fiddle leaf fig\n• Most houseplants\n• Peace lilies\n\n**Low Light:** (north-facing windows)\n• Snake plants, pothos\n• ZZ plants\n• Chinese evergreen\n\n**Signs of wrong lighting:**\n• Leggy growth (too little)\n• Scorched leaves (too much)\n\nWhat's your lighting situation like?`
    }
    
    // Beginner plants
    if (lowerMessage.includes('beginner') || lowerMessage.includes('easy') || lowerMessage.includes('first plant')) {
      return `Perfect! Let me recommend some bulletproof plants for beginners! 🌿\n\n**Super Easy Plants:**\n• Snake Plant - tolerates neglect, low light\n• Pothos - grows anywhere, easy to propagate\n• ZZ Plant - drought tolerant, glossy leaves\n• Spider Plant - produces babies, air purifying\n\n**Slightly More Involved:**\n• Monstera - Instagram worthy, moderate care\n• Peace Lily - tells you when thirsty\n• Rubber Plant - beautiful, forgiving\n\n**Beginner Tips:**\n• Start with 1-2 plants\n• Choose based on your light conditions\n• Don't overwater (most common mistake!)\n\nWhich type of space are you decorating?`
    }
    
    // Seasonal care
    if (lowerMessage.includes('winter') || lowerMessage.includes('season')) {
      return `Seasonal plant care is essential! 🍂 Here's my seasonal guide:\n\n**Winter Care:**\n• Reduce watering frequency\n• Stop fertilizing\n• Increase humidity (dry air)\n• Move away from heating vents\n\n**Spring Care:**\n• Resume regular watering\n• Start fertilizing monthly\n• Repot if needed\n• Begin outdoor transition\n\n**Summer Care:**\n• Water more frequently\n• Provide afternoon shade\n• Watch for pests\n• Increase air circulation\n\n**Fall Care:**\n• Gradually reduce watering\n• Bring outdoor plants inside\n• Final fertilizer of the season\n\nWhat season are you preparing for?`
    }
    
    // Default responses with personality
    const defaultResponses = [
      `That's a great question! 🌱 As an AI plant expert, I'm always excited to help fellow plant parents. Could you tell me more details so I can give you the best advice?`,
      
      `I love helping with plant questions! 🌿 Whether it's identification, care tips, or troubleshooting problems, I'm here for you. What specific challenge are you facing?`,
      
      `Every plant parent needs support! 🍃 I've helped thousands of people grow healthy, happy plants. Let me know more about your situation and I'll provide personalized recommendations.`,
      
      `Plants are my passion! 🌺 From tiny succulents to giant monstera, I've got advice for every green friend. What would you like to explore together?`
    ]
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateBotResponse(inputMessage),
        timestamp: new Date(),
        suggestions: inputMessage.toLowerCase().includes('identify') 
          ? ["Upload a plant photo", "Describe the leaves", "Tell me about flowers", "Where did you find it?"]
          : inputMessage.toLowerCase().includes('water')
          ? ["Create watering schedule", "Check soil moisture", "Signs of overwatering", "Best watering tools"]
          : inputMessage.toLowerCase().includes('beginner')
          ? ["Snake plant care", "Pothos propagation", "ZZ plant tips", "Spider plant babies"]
          : ["Ask another question", "Get care calendar", "Plant identification", "Disease diagnosis"]
      }
      
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 2000)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-lg border-b border-emerald-100 shadow-lg sticky top-0 z-10"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  AI Plant Care Assistant
                </h1>
                <p className="text-gray-600 text-sm">
                  Powered by advanced plant care AI • Always here to help 🌱
                </p>
              </div>
            </div>

            {/* Bot Personality Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Chat with:</span>
              <select 
                value={selectedBot.name}
                onChange={(e) => {
                  const bot = plantPersonalities.find(b => b.name === e.target.value)
                  if (bot) setSelectedBot(bot)
                }}
                className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium border-0 focus:ring-2 focus:ring-emerald-300"
              >
                {plantPersonalities.map((bot) => (
                  <option key={bot.name} value={bot.name}>
                    {bot.avatar} {bot.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4" style={{ maxHeight: '600px' }}>
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg shadow-lg ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                        : 'bg-gradient-to-r from-emerald-500 to-green-600'
                    }`}>
                      {message.type === 'user' ? <User className="h-5 w-5" /> : selectedBot.avatar}
                    </div>

                    {/* Message Content */}
                    <div className={`relative p-4 rounded-2xl shadow-md ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-gray-50 text-gray-800'
                    }`}>
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </div>
                      
                      {/* Suggestions */}
                      {message.suggestions && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs opacity-75 font-medium">Quick suggestions:</p>
                          {message.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="block w-full text-left p-2 rounded-lg bg-emerald-100 text-emerald-700 text-xs hover:bg-emerald-200 transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center text-white text-lg shadow-lg">
                    {selectedBot.avatar}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl shadow-md">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex flex-wrap gap-2 mb-4">
              {quickSuggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-full text-sm font-medium hover:bg-emerald-200 transition-colors"
                >
                  {suggestion.icon}
                  <span>{suggestion.text}</span>
                </motion.button>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about plants..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-colors"
                  disabled={isTyping}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: <Camera className="h-6 w-6" />,
              title: "Visual Plant ID",
              description: "Upload photos for instant plant identification",
              color: "from-blue-500 to-cyan-500"
            },
            {
              icon: <Heart className="h-6 w-6" />,
              title: "Health Diagnosis",
              description: "Get expert diagnosis for plant problems",
              color: "from-red-500 to-pink-500"
            },
            {
              icon: <Calendar className="h-6 w-6" />,
              title: "Care Schedules",
              description: "Personalized watering and care routines",
              color: "from-emerald-500 to-green-500"
            }
          ].map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} text-white flex items-center justify-center mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}