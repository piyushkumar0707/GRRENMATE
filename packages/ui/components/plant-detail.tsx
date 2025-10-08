import * as React from "react"
import { useState, useMemo } from "react"
import { cn, formatTimeAgo, getPlantHealthStatus } from "../lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card"
import { Button } from "./button"
import {
  Droplet,
  Sun,
  ThermometerSun,
  Wind,
  Calendar,
  MapPin,
  Heart,
  Share2,
  Bookmark,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Camera,
  MessageCircle,
  Users,
  Star,
  Leaf,
  Zap,
  Info,
  Settings,
  Plus,
  Edit,
  Download,
  Upload,
  Eye,
  Award
} from "lucide-react"

export interface PlantDetailData {
  id: string
  name: string
  scientificName: string
  type: string
  health: number
  lastWatered: Date
  nextWatering: Date
  location: string
  images: string[]
  description: string
  careGuide: {
    watering: {
      frequency: string
      amount: string
      tips: string[]
    }
    light: {
      requirement: string
      hours: string
      tips: string[]
    }
    temperature: {
      min: number
      max: number
      ideal: string
      tips: string[]
    }
    humidity: {
      level: string
      percentage: string
      tips: string[]
    }
    fertilizer: {
      frequency: string
      type: string
      tips: string[]
    }
    repotting: {
      frequency: string
      season: string
      tips: string[]
    }
  }
  healthHistory: Array<{
    date: Date
    health: number
    notes?: string
  }>
  careLog: Array<{
    id: string
    type: 'watering' | 'fertilizing' | 'repotting' | 'pruning' | 'note'
    date: Date
    notes?: string
    user: string
  }>
  commonIssues: Array<{
    issue: string
    symptoms: string[]
    solutions: string[]
    severity: 'low' | 'medium' | 'high'
  }>
  communityPosts: Array<{
    id: string
    user: {
      name: string
      avatar: string
      level: string
    }
    content: string
    image?: string
    date: Date
    likes: number
    replies: number
    helpful: boolean
  }>
  isBookmarked: boolean
  careStreak: number
  achievements: Array<{
    id: string
    title: string
    description: string
    icon: string
    unlockedAt: Date
  }>
}

export interface PlantDetailProps {
  plant: PlantDetailData
  onWater?: () => void
  onBookmark?: () => void
  onShare?: () => void
  onEditCare?: () => void
  onAddPhoto?: () => void
  onDiseaseCheck?: () => void
  onCommunityPost?: (content: string) => void
  className?: string
}

const PlantDetail = React.forwardRef<HTMLDivElement, PlantDetailProps>(
  ({ 
    plant, 
    onWater, 
    onBookmark, 
    onShare, 
    onEditCare, 
    onAddPhoto, 
    onDiseaseCheck,
    onCommunityPost,
    className 
  }, ref) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'care' | 'health' | 'community'>('overview')
    const [selectedImage, setSelectedImage] = useState(0)
    const [communityInput, setCommunityInput] = useState('')

    const healthStatus = getPlantHealthStatus(plant.health)
    const daysUntilWatering = Math.ceil((plant.nextWatering.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    const isOverdue = daysUntilWatering < 0

    const tabs = [
      { id: 'overview', label: 'Overview', icon: Eye },
      { id: 'care', label: 'Care Guide', icon: Leaf },
      { id: 'health', label: 'Health', icon: Heart },
      { id: 'community', label: 'Community', icon: Users }
    ]

    return (
      <div ref={ref} className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
        {/* Header Section */}
        <Card variant="gradient" className="overflow-hidden">
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 plant-pattern opacity-10" />
            
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {/* Image Gallery */}
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-gray-100 h-80">
                    <img
                      src={plant.images[selectedImage]}
                      alt={plant.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        size="icon-sm"
                        variant="glass"
                        onClick={onDiseaseCheck}
                        className="bg-white/20 hover:bg-white/30"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="glass"
                        onClick={onAddPhoto}
                        className="bg-white/20 hover:bg-white/30"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {plant.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {plant.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={cn(
                            "w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-200",
                            selectedImage === index
                              ? "border-primary-400 scale-105"
                              : "border-transparent hover:border-primary-200"
                          )}
                        >
                          <img
                            src={image}
                            alt={`${plant.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Plant Info */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h1 className="text-3xl font-bold font-heading text-gray-900">
                        {plant.name}
                      </h1>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={onBookmark}
                          className={plant.isBookmarked ? "text-yellow-500" : ""}
                        >
                          <Bookmark className={cn("h-5 w-5", plant.isBookmarked && "fill-current")} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={onShare}
                        >
                          <Share2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 italic mb-3">{plant.scientificName}</p>
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {plant.type}
                      </span>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 text-sm">{plant.location}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed">{plant.description}</p>
                  </div>

                  {/* Health Status */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Health Status</span>
                      <div className={cn("px-3 py-1 rounded-full text-sm font-medium", healthStatus.bgColor, healthStatus.color)}>
                        {plant.health}% - {healthStatus.status}
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={cn("h-3 rounded-full transition-all duration-500 progress-glow",
                          plant.health >= 80 ? "bg-green-500" : 
                          plant.health >= 60 ? "bg-yellow-500" : "bg-red-500"
                        )}
                        style={{ width: `${plant.health}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/70 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Droplet className="h-4 w-4 text-blue-500" />
                        <span className="text-xs text-gray-600 uppercase tracking-wide">Next Watering</span>
                      </div>
                      <p className={cn("text-sm font-medium", isOverdue ? "text-red-600" : "text-gray-900")}>
                        {isOverdue ? `${Math.abs(daysUntilWatering)} days overdue` : `In ${daysUntilWatering} days`}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-white/70 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="text-xs text-gray-600 uppercase tracking-wide">Care Streak</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{plant.careStreak} days</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="plant"
                      className="flex-1"
                      onClick={onWater}
                      leftIcon={<Droplet className="h-4 w-4" />}
                    >
                      Water Plant
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onEditCare}
                      leftIcon={<Edit className="h-4 w-4" />}
                    >
                      Edit Care
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Achievements */}
        {plant.achievements.length > 0 && (
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 overflow-x-auto">
                {plant.achievements.slice(0, 4).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex-shrink-0 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg text-center min-w-[120px]"
                  >
                    <div className="text-2xl mb-2">{achievement.icon}</div>
                    <h4 className="font-medium text-sm text-yellow-800">{achievement.title}</h4>
                    <p className="text-xs text-yellow-600 mt-1">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Care Log */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Care Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plant.careLog.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm",
                          log.type === 'watering' ? "bg-blue-500" :
                          log.type === 'fertilizing' ? "bg-green-500" :
                          log.type === 'repotting' ? "bg-purple-500" :
                          log.type === 'pruning' ? "bg-orange-500" : "bg-gray-500"
                        )}>
                          {log.type === 'watering' ? '💧' :
                           log.type === 'fertilizing' ? '🌱' :
                           log.type === 'repotting' ? '🪴' :
                           log.type === 'pruning' ? '✂️' : '📝'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm capitalize">{log.type}</p>
                          <p className="text-xs text-gray-600">{formatTimeAgo(log.date)}</p>
                          {log.notes && <p className="text-xs text-gray-500 mt-1">{log.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Common Issues */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Common Issues & Solutions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plant.commonIssues.slice(0, 3).map((issue, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className={cn(
                            "h-4 w-4",
                            issue.severity === 'high' ? "text-red-500" :
                            issue.severity === 'medium' ? "text-yellow-500" : "text-green-500"
                          )} />
                          <h4 className="font-medium text-sm">{issue.issue}</h4>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          <strong>Symptoms:</strong> {issue.symptoms.join(', ')}
                        </p>
                        <p className="text-xs text-gray-700">
                          <strong>Solutions:</strong> {issue.solutions[0]}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'care' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Watering */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Droplet className="h-5 w-5 text-blue-500" />
                    Watering
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-sm text-gray-700">Frequency</p>
                    <p className="text-gray-600">{plant.careGuide.watering.frequency}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-700">Amount</p>
                    <p className="text-gray-600">{plant.careGuide.watering.amount}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-700 mb-2">Tips</p>
                    <ul className="space-y-1">
                      {plant.careGuide.watering.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-primary-500 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Light */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sun className="h-5 w-5 text-yellow-500" />
                    Light Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-sm text-gray-700">Requirement</p>
                    <p className="text-gray-600">{plant.careGuide.light.requirement}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-700">Daily Hours</p>
                    <p className="text-gray-600">{plant.careGuide.light.hours}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-700 mb-2">Tips</p>
                    <ul className="space-y-1">
                      {plant.careGuide.light.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-primary-500 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Temperature */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ThermometerSun className="h-5 w-5 text-red-500" />
                    Temperature
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-sm text-gray-700">Range</p>
                    <p className="text-gray-600">{plant.careGuide.temperature.min}°F - {plant.careGuide.temperature.max}°F</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-700">Ideal</p>
                    <p className="text-gray-600">{plant.careGuide.temperature.ideal}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-700 mb-2">Tips</p>
                    <ul className="space-y-1">
                      {plant.careGuide.temperature.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-primary-500 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Humidity */}
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wind className="h-5 w-5 text-cyan-500" />
                    Humidity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-sm text-gray-700">Level</p>
                    <p className="text-gray-600">{plant.careGuide.humidity.level}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-700">Percentage</p>
                    <p className="text-gray-600">{plant.careGuide.humidity.percentage}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-700 mb-2">Tips</p>
                    <ul className="space-y-1">
                      {plant.careGuide.humidity.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-primary-500 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Health Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Health History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">Health chart visualization</p>
                        <p className="text-sm text-gray-400">Would show health trends over time</p>
                      </div>
                    </div>
                    
                    {/* Recent Health Records */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">Recent Records</h4>
                      {plant.healthHistory.slice(0, 5).map((record, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-600">{formatTimeAgo(record.date)}</span>
                          <span className={cn("text-sm font-medium",
                            record.health >= 80 ? "text-green-600" :
                            record.health >= 60 ? "text-yellow-600" : "text-red-600"
                          )}>
                            {record.health}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Disease Detection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Disease Detection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h4 className="font-medium text-gray-700 mb-2">Check for Diseases</h4>
                      <p className="text-sm text-gray-500 mb-4">
                        Upload a photo of your plant's leaves to detect potential diseases
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={onDiseaseCheck}
                        leftIcon={<Camera className="h-4 w-4" />}
                      >
                        Take Photo
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-gray-700">Prevention Tips</h4>
                      <ul className="space-y-2">
                        <li className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Ensure proper air circulation
                        </li>
                        <li className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Water at soil level, avoid wetting leaves
                        </li>
                        <li className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Remove dead or yellowing leaves promptly
                        </li>
                        <li className="text-sm text-gray-600 flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          Maintain appropriate humidity levels
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'community' && (
            <div className="space-y-6">
              {/* Post Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Share with Community</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <textarea
                      value={communityInput}
                      onChange={(e) => setCommunityInput(e.target.value)}
                      placeholder="Share your experience, ask questions, or give tips about this plant..."
                      className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      rows={3}
                    />
                    <div className="flex justify-between items-center">
                      <Button variant="ghost" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Add Photo
                      </Button>
                      <Button 
                        variant="gradient"
                        onClick={() => {
                          if (communityInput.trim()) {
                            onCommunityPost?.(communityInput)
                            setCommunityInput('')
                          }
                        }}
                        disabled={!communityInput.trim()}
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Community Posts */}
              <div className="space-y-4">
                {plant.communityPosts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <img
                          src={post.user.avatar}
                          alt={post.user.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm">{post.user.name}</h4>
                            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                              {post.user.level}
                            </span>
                            {post.helpful && (
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{post.content}</p>
                          
                          {post.image && (
                            <div className="mb-3">
                              <img
                                src={post.image}
                                alt="Community post"
                                className="w-full max-w-md h-48 object-cover rounded-lg"
                              />
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>{formatTimeAgo(post.date)}</span>
                            <div className="flex items-center gap-4">
                              <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                                <Heart className="h-4 w-4" />
                                {post.likes}
                              </button>
                              <button className="flex items-center gap-1 hover:text-primary-600 transition-colors">
                                <MessageCircle className="h-4 w-4" />
                                {post.replies}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
)

PlantDetail.displayName = "PlantDetail"

export { PlantDetail }