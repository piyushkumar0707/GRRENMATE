'use client'

import { PlantDetail, PlantDetailData } from '@greenmate/ui'
import Link from 'next/link'
import { ArrowLeft, Leaf } from 'lucide-react'

// Mock comprehensive plant data
const mockPlantDetail: PlantDetailData = {
  id: '1',
  name: 'Monstera Deliciosa',
  scientificName: 'Monstera deliciosa',
  type: 'Tropical',
  health: 92,
  lastWatered: new Date('2024-01-06'),
  nextWatering: new Date('2024-01-09'),
  location: 'Living Room',
  images: [
    'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1463594373500-04d4f1e0e8b4?w=600&h=400&fit=crop'
  ],
  description: 'A stunning tropical houseplant known for its large, glossy leaves with distinctive holes and splits. Native to the rainforests of Central America, it\'s become one of the most popular houseplants for its dramatic foliage and relatively easy care. The fenestrations (holes) develop as the plant matures, creating an architectural statement piece.',
  careGuide: {
    watering: {
      frequency: 'Every 1-2 weeks',
      amount: '2-3 cups of water',
      tips: [
        'Water when top 2 inches of soil are dry',
        'Check soil moisture with your finger',
        'Reduce watering in winter months',
        'Use filtered or distilled water if possible',
        'Water early in the morning'
      ]
    },
    light: {
      requirement: 'Bright, indirect sunlight',
      hours: '6-8 hours daily',
      tips: [
        'Place near a north or east-facing window',
        'Avoid direct sunlight which can scorch leaves',
        'Can tolerate lower light but growth will slow',
        'Rotate weekly for even growth',
        'Consider grow lights in winter'
      ]
    },
    temperature: {
      min: 65,
      max: 85,
      ideal: '70-75°F (21-24°C)',
      tips: [
        'Avoid cold drafts and heating vents',
        'Consistent temperatures are key',
        'Can handle brief temperature drops',
        'Higher humidity helps with heat tolerance',
        'Move away from air conditioning in summer'
      ]
    },
    humidity: {
      level: 'Moderate to High',
      percentage: '40-60%',
      tips: [
        'Use a humidifier during dry seasons',
        'Group with other plants',
        'Place on a pebble tray with water',
        'Mist leaves occasionally (not daily)',
        'Keep away from heating sources'
      ]
    },
    fertilizer: {
      frequency: 'Monthly during growing season',
      type: 'Balanced liquid fertilizer (20-20-20)',
      tips: [
        'Fertilize from spring through early fall',
        'Dilute fertilizer to half strength',
        'Stop fertilizing in winter',
        'Flush soil monthly to prevent salt buildup'
      ]
    },
    repotting: {
      frequency: 'Every 2-3 years',
      season: 'Spring',
      tips: [
        'Choose a pot 1-2 inches larger in diameter',
        'Use well-draining potting mix',
        'Add perlite for extra drainage',
        'Don\'t water immediately after repotting'
      ]
    }
  },
  healthHistory: [
    { date: new Date('2024-01-06'), health: 92 },
    { date: new Date('2024-01-01'), health: 89 },
    { date: new Date('2023-12-25'), health: 87 },
    { date: new Date('2023-12-20'), health: 85 },
    { date: new Date('2023-12-15'), health: 88 },
    { date: new Date('2023-12-10'), health: 90 },
    { date: new Date('2023-12-05'), health: 86 }
  ],
  careLog: [
    {
      id: '1',
      type: 'watering',
      date: new Date('2024-01-06'),
      notes: 'Soil was getting dry, gave thorough watering',
      user: 'You'
    },
    {
      id: '2',
      type: 'fertilizing',
      date: new Date('2024-01-01'),
      notes: 'Monthly feeding with diluted liquid fertilizer',
      user: 'You'
    },
    {
      id: '3',
      type: 'pruning',
      date: new Date('2023-12-28'),
      notes: 'Removed yellowing bottom leaf',
      user: 'You'
    },
    {
      id: '4',
      type: 'note',
      date: new Date('2023-12-25'),
      notes: 'New leaf unfurling with beautiful fenestrations!',
      user: 'You'
    },
    {
      id: '5',
      type: 'watering',
      date: new Date('2023-12-22'),
      notes: 'Regular watering schedule',
      user: 'You'
    }
  ],
  commonIssues: [
    {
      issue: 'Yellow Leaves',
      symptoms: ['Leaves turning yellow from bottom up', 'Soft, mushy stems'],
      solutions: [
        'Reduce watering frequency',
        'Ensure proper drainage',
        'Check for root rot',
        'Remove affected leaves'
      ],
      severity: 'medium'
    },
    {
      issue: 'Brown Leaf Tips',
      symptoms: ['Crispy brown edges on leaves', 'Dry soil'],
      solutions: [
        'Increase humidity around plant',
        'Water more consistently',
        'Use filtered water',
        'Check for proper drainage'
      ],
      severity: 'low'
    },
    {
      issue: 'Small Leaves Without Holes',
      symptoms: ['New leaves are small', 'No fenestrations developing'],
      solutions: [
        'Provide brighter light',
        'Add a moss pole for climbing',
        'Ensure adequate nutrients',
        'Be patient - fenestrations develop with maturity'
      ],
      severity: 'low'
    },
    {
      issue: 'Pest Infestation',
      symptoms: ['Spider mites', 'Scale insects', 'Sticky leaves'],
      solutions: [
        'Isolate plant immediately',
        'Wipe leaves with neem oil',
        'Increase humidity',
        'Check other plants nearby'
      ],
      severity: 'high'
    }
  ],
  communityPosts: [
    {
      id: '1',
      user: {
        name: 'PlantMom Sarah',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b714?w=64&h=64&fit=crop&crop=face',
        level: 'Expert'
      },
      content: 'Just got my first fenestration on a new leaf! The key was giving it a moss pole to climb and consistent bright, indirect light. So excited to see it develop!',
      image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=300&h=200&fit=crop',
      date: new Date('2024-01-05'),
      likes: 24,
      replies: 8,
      helpful: true
    },
    {
      id: '2',
      user: {
        name: 'GreenThumb_Jake',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face',
        level: 'Intermediate'
      },
      content: 'Has anyone experienced yellowing leaves during winter? Mine seems to be struggling with the lower humidity. Thinking of getting a humidifier.',
      date: new Date('2024-01-04'),
      likes: 12,
      replies: 15,
      helpful: false
    },
    {
      id: '3',
      user: {
        name: 'Urban_Jungle_Queen',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face',
        level: 'Expert'
      },
      content: 'Pro tip: If your Monstera isn\'t developing fenestrations, try these steps: 1) Provide a moss pole, 2) Increase light (but keep it indirect), 3) Feed regularly during growing season. Patience is key!',
      date: new Date('2024-01-03'),
      likes: 45,
      replies: 12,
      helpful: true
    },
    {
      id: '4',
      user: {
        name: 'NewPlantParent',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=face',
        level: 'Beginner'
      },
      content: 'Just brought home my first Monstera! Any beginner tips? I\'m so nervous about killing it 😅',
      date: new Date('2024-01-02'),
      likes: 8,
      replies: 23,
      helpful: false
    }
  ],
  isBookmarked: true,
  careStreak: 45,
  achievements: [
    {
      id: '1',
      title: 'Fenestration Master',
      description: 'Successfully grew fenestrated leaves',
      icon: '🕳️',
      unlockedAt: new Date('2023-12-15')
    },
    {
      id: '2',
      title: 'Care Streak Champion',
      description: '30 days of consistent care',
      icon: '🏆',
      unlockedAt: new Date('2024-01-01')
    },
    {
      id: '3',
      title: 'Growth Guru',
      description: 'Plant grew 6+ inches',
      icon: '📏',
      unlockedAt: new Date('2023-11-20')
    },
    {
      id: '4',
      title: 'Community Helper',
      description: 'Helped 10+ plant parents',
      icon: '🤝',
      unlockedAt: new Date('2023-12-25')
    }
  ]
}

interface PlantDetailPageProps {
  params: {
    id: string
  }
}

export default function PlantDetailPage({ params }: PlantDetailPageProps) {
  const handleWater = () => {
    console.log('Watering plant...')
    // In real app, this would update plant data and sync to backend
  }

  const handleBookmark = () => {
    console.log('Toggling bookmark...')
    // In real app, this would toggle bookmark status
  }

  const handleShare = () => {
    console.log('Sharing plant...')
    // In real app, this would open share modal or copy link
  }

  const handleEditCare = () => {
    console.log('Opening care editor...')
    // In real app, this would open care schedule editor
  }

  const handleAddPhoto = () => {
    console.log('Adding photo...')
    // In real app, this would open photo upload modal
  }

  const handleDiseaseCheck = () => {
    console.log('Starting disease check...')
    // In real app, this would open disease detection interface
  }

  const handleCommunityPost = (content: string) => {
    console.log('Posting to community:', content)
    // In real app, this would submit post to backend
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Navigation */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link 
            href="/demo/dashboard"
            className="flex items-center space-x-2 text-foreground hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <Leaf className="h-5 w-5 text-primary-600" />
            <span className="text-lg font-heading font-semibold">Plant Details</span>
          </div>
        </nav>
      </header>

      {/* Plant Detail */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <PlantDetail
          plant={mockPlantDetail}
          onWater={handleWater}
          onBookmark={handleBookmark}
          onShare={handleShare}
          onEditCare={handleEditCare}
          onAddPhoto={handleAddPhoto}
          onDiseaseCheck={handleDiseaseCheck}
          onCommunityPost={handleCommunityPost}
        />
      </section>

      {/* Tips Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Interactive Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/50 rounded-xl border border-white/20">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                📸
              </div>
              <h3 className="font-semibold mb-2">Disease Detection</h3>
              <p className="text-sm text-muted-foreground">
                Click the camera icon to simulate AI-powered disease detection on plant leaves
              </p>
            </div>
            
            <div className="text-center p-6 bg-white/50 rounded-xl border border-white/20">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                📊
              </div>
              <h3 className="font-semibold mb-2">Care Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive care logs, health history, and automated reminders
              </p>
            </div>
            
            <div className="text-center p-6 bg-white/50 rounded-xl border border-white/20">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                👥
              </div>
              <h3 className="font-semibold mb-2">Community</h3>
              <p className="text-sm text-muted-foreground">
                Connect with other plant enthusiasts, share tips, and get expert advice
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}