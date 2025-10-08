import * as React from "react"
import { useState, useMemo } from "react"
import { cn, formatTimeAgo, getPlantHealthStatus } from "../lib/utils"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, PlantCard } from "./card"
import { Button } from "./button"
import {
  Droplet,
  Sun,
  ThermometerSun,
  Wind,
  Calendar,
  TrendingUp,
  Award,
  Leaf,
  Plus,
  Bell,
  Settings,
  Filter,
  Search,
  Grid3X3,
  List,
  ChevronDown,
  Sparkles,
  Heart,
  Camera
} from "lucide-react"

export interface PlantData {
  id: string
  name: string
  type: string
  health: number
  lastWatered: Date
  nextWatering: Date
  image?: string
  location: string
  notes?: string
}

export interface DashboardStats {
  totalPlants: number
  healthyPlants: number
  needsAttention: number
  overduePlants: number
  weeklyGrowth: number
  streakDays: number
}

export interface PlantDashboardProps {
  plants: PlantData[]
  stats: DashboardStats
  onAddPlant?: () => void
  onWaterPlant?: (plantId: string) => void
  onPlantClick?: (plant: PlantData) => void
  className?: string
}

const PlantDashboard = React.forwardRef<HTMLDivElement, PlantDashboardProps>(
  ({ plants, stats, onAddPlant, onWaterPlant, onPlantClick, className }, ref) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [filterType, setFilterType] = useState<'all' | 'needs-water' | 'healthy' | 'attention'>('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Filter and search plants
    const filteredPlants = useMemo(() => {
      let filtered = plants

      // Apply type filter
      if (filterType === 'needs-water') {
        filtered = filtered.filter(plant => new Date() >= plant.nextWatering)
      } else if (filterType === 'healthy') {
        filtered = filtered.filter(plant => plant.health >= 80)
      } else if (filterType === 'attention') {
        filtered = filtered.filter(plant => plant.health < 70)
      }

      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(plant => 
          plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          plant.type.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }

      return filtered
    }, [plants, filterType, searchQuery])

    const healthDistribution = useMemo(() => {
      const healthy = plants.filter(p => p.health >= 80).length
      const good = plants.filter(p => p.health >= 60 && p.health < 80).length
      const needsAttention = plants.filter(p => p.health < 60).length
      
      return { healthy, good, needsAttention }
    }, [plants])

    const upcomingTasks = useMemo(() => {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
      const overdue = plants.filter(p => p.nextWatering < today)
      const todayTasks = plants.filter(p => 
        p.nextWatering.toDateString() === today.toDateString()
      )
      const tomorrowTasks = plants.filter(p => 
        p.nextWatering.toDateString() === tomorrow.toDateString()
      )
      
      return { overdue, today: todayTasks, tomorrow: tomorrowTasks }
    }, [plants])

    return (
      <div ref={ref} className={cn("w-full max-w-7xl mx-auto space-y-6", className)}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-heading gradient-text">
              My Plant Collection
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and track your {plants.length} plants
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </Button>
            <Button variant="gradient" onClick={onAddPlant}>
              <Plus className="h-4 w-4 mr-2" />
              Add Plant
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card variant="soft" className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalPlants}</p>
                <p className="text-xs text-muted-foreground">Total Plants</p>
              </div>
            </div>
          </Card>

          <Card variant="soft" className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.healthyPlants}</p>
                <p className="text-xs text-muted-foreground">Healthy</p>
              </div>
            </div>
          </Card>

          <Card variant="soft" className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.needsAttention}</p>
                <p className="text-xs text-muted-foreground">Need Care</p>
              </div>
            </div>
          </Card>

          <Card variant="soft" className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                <Droplet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{upcomingTasks.overdue.length}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </Card>

          <Card variant="soft" className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">+{stats.weeklyGrowth}%</p>
                <p className="text-xs text-muted-foreground">Growth</p>
              </div>
            </div>
          </Card>

          <Card variant="soft" className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.streakDays}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions & Health Overview */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Upcoming Tasks */}
          <Card variant="elevated" className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary-600" />
                  <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
                </div>
                <Button variant="ghost" size="sm">View All</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingTasks.overdue.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-red-700">Overdue ({upcomingTasks.overdue.length})</span>
                  </div>
                  {upcomingTasks.overdue.slice(0, 2).map(plant => (
                    <div key={plant.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <Droplet className="h-4 w-4 text-red-600" />
                        </div>
                        <span className="text-sm font-medium">{plant.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onWaterPlant?.(plant.id)}
                        className="text-red-600 hover:bg-red-100"
                      >
                        Water Now
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {upcomingTasks.today.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm font-medium text-blue-700">Today ({upcomingTasks.today.length})</span>
                  </div>
                  {upcomingTasks.today.slice(0, 3).map(plant => (
                    <div key={plant.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Droplet className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm">{plant.name}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onWaterPlant?.(plant.id)}
                        className="text-blue-600 hover:bg-blue-100"
                      >
                        Water
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {upcomingTasks.overdue.length === 0 && upcomingTasks.today.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>All caught up! No tasks for today.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Health Overview */}
          <Card variant="elevated" className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-primary-600" />
                <CardTitle className="text-lg">Collection Health</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overall Health</span>
                  <span className="text-2xl font-bold text-green-600">
                    {Math.round((stats.healthyPlants / stats.totalPlants) * 100)}%
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                      <span className="text-sm">Healthy</span>
                    </div>
                    <span className="text-sm font-medium">{healthDistribution.healthy}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <span className="text-sm">Good</span>
                    </div>
                    <span className="text-sm font-medium">{healthDistribution.good}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full" />
                      <span className="text-sm">Needs Attention</span>
                    </div>
                    <span className="text-sm font-medium">{healthDistribution.needsAttention}</span>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.healthyPlants / stats.totalPlants) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search plants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All ({plants.length})
            </Button>
            <Button
              variant={filterType === 'needs-water' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('needs-water')}
            >
              Needs Water ({upcomingTasks.overdue.length + upcomingTasks.today.length})
            </Button>
            <Button
              variant={filterType === 'healthy' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('healthy')}
            >
              Healthy ({healthDistribution.healthy})
            </Button>
            <Button
              variant={filterType === 'attention' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('attention')}
            >
              Attention ({healthDistribution.needsAttention})
            </Button>
          </div>
        </div>

        {/* Plants Grid/List */}
        {filteredPlants.length === 0 ? (
          <Card className="text-center py-12">
            <div className="space-y-4">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No plants found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || filterType !== 'all' 
                    ? "Try adjusting your search or filters"
                    : "Start by adding your first plant!"
                  }
                </p>
              </div>
              {(!searchQuery && filterType === 'all') && (
                <Button variant="gradient" onClick={onAddPlant}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Plant
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          )}>
            {filteredPlants.map((plant, index) => (
              <div
                key={plant.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <PlantCard
                  plantName={plant.name}
                  plantType={plant.type}
                  health={plant.health}
                  lastWatered={plant.lastWatered}
                  image={plant.image}
                  onWater={() => onWaterPlant?.(plant.id)}
                  onViewDetails={() => onPlantClick?.(plant)}
                  className="h-full cursor-pointer transition-all duration-200 hover:shadow-lg"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

PlantDashboard.displayName = "PlantDashboard"

export { PlantDashboard }