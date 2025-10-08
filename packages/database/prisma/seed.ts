import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting GreenMate database seed...')

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@greenmate.app' },
    update: {},
    create: {
      email: 'admin@greenmate.app',
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          bio: 'GreenMate administrator and plant expert',
          location: 'San Francisco, CA',
          experience: 'EXPERT',
        }
      },
      gamification: {
        create: {
          points: 1000,
          level: 5,
          streak: 30,
          plantsOwned: 50,
          plantsIdentified: 200,
          postsCreated: 25,
        }
      }
    }
  })

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@greenmate.app' },
    update: {},
    create: {
      email: 'demo@greenmate.app',
      username: 'plantlover',
      password: hashedPassword,
      profile: {
        create: {
          firstName: 'Plant',
          lastName: 'Lover',
          bio: 'Passionate about houseplants and sustainable living 🌿',
          location: 'New York, NY',
          experience: 'INTERMEDIATE',
        }
      },
      gamification: {
        create: {
          points: 250,
          level: 2,
          streak: 7,
          plantsOwned: 12,
          plantsIdentified: 25,
          postsCreated: 5,
        }
      }
    }
  })

  // Create sample plants
  const plants = [
    {
      name: 'Monstera Deliciosa',
      scientificName: 'Monstera deliciosa',
      family: 'Araceae',
      commonNames: ['Swiss Cheese Plant', 'Split Leaf Philodendron'],
      difficulty: 'EASY' as const,
      size: 'LARGE' as const,
      purposes: ['DECORATIVE', 'AIR_FILTERING'] as const,
      climateZones: ['10a', '10b', '11'],
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      ],
      description: 'The Monstera Deliciosa is a popular houseplant known for its distinctive split leaves and easy care requirements.',
      medicinalUses: [],
      commonIssues: ['Yellowing leaves from overwatering', 'Brown tips from low humidity'],
      co2Absorption: 12.5,
      oxygenProduction: 6.0,
      care: {
        lightRequirement: 'MEDIUM' as const,
        lightHours: 6,
        wateringFrequency: 'WEEKLY' as const,
        wateringAmount: '500ml or until drainage',
        humidity: 60,
        tempMin: 18,
        tempMax: 27,
        soilType: 'Well-draining potting mix',
        fertilizingFreq: 'Monthly during growing season',
        repottingFreq: 'Every 2-3 years'
      }
    },
    {
      name: 'Snake Plant',
      scientificName: 'Sansevieria trifasciata',
      family: 'Asparagaceae',
      commonNames: ['Mother-in-Law\'s Tongue', 'Viper\'s Bowstring Hemp'],
      difficulty: 'EASY' as const,
      size: 'MEDIUM' as const,
      purposes: ['DECORATIVE', 'AIR_FILTERING'] as const,
      climateZones: ['9b', '10a', '10b', '11'],
      images: [
        'https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=800',
      ],
      description: 'Snake plants are extremely hardy and can tolerate low light and infrequent watering.',
      medicinalUses: ['Air purification'],
      commonIssues: ['Root rot from overwatering', 'Wrinkled leaves from underwatering'],
      co2Absorption: 8.0,
      oxygenProduction: 4.5,
      care: {
        lightRequirement: 'LOW' as const,
        lightHours: 4,
        wateringFrequency: 'BIWEEKLY' as const,
        wateringAmount: '200ml',
        humidity: 40,
        tempMin: 15,
        tempMax: 30,
        soilType: 'Cactus/succulent mix',
        fertilizingFreq: 'Every 2 months during growing season',
        repottingFreq: 'Every 3-5 years'
      }
    },
    {
      name: 'Pothos',
      scientificName: 'Epipremnum aureum',
      family: 'Araceae',
      commonNames: ['Golden Pothos', 'Devil\'s Ivy'],
      difficulty: 'EASY' as const,
      size: 'MEDIUM' as const,
      purposes: ['DECORATIVE', 'AIR_FILTERING'] as const,
      climateZones: ['10a', '10b', '11'],
      images: [
        'https://images.unsplash.com/photo-1586953268916-9c8eb4a8bc05?w=800',
      ],
      description: 'Pothos is one of the easiest houseplants to grow, perfect for beginners.',
      medicinalUses: [],
      commonIssues: ['Yellowing leaves', 'Leggy growth in low light'],
      co2Absorption: 10.0,
      oxygenProduction: 5.2,
      care: {
        lightRequirement: 'MEDIUM' as const,
        lightHours: 5,
        wateringFrequency: 'WEEKLY' as const,
        wateringAmount: '300ml',
        humidity: 50,
        tempMin: 16,
        tempMax: 26,
        soilType: 'Regular potting soil',
        fertilizingFreq: 'Monthly during growing season',
        repottingFreq: 'Every 2-3 years'
      }
    },
    {
      name: 'Fiddle Leaf Fig',
      scientificName: 'Ficus lyrata',
      family: 'Moraceae',
      commonNames: ['Fiddle Leaf Fig Tree'],
      difficulty: 'HARD' as const,
      size: 'LARGE' as const,
      purposes: ['DECORATIVE'] as const,
      climateZones: ['10a', '10b', '11'],
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      ],
      description: 'A stunning statement plant with large, violin-shaped leaves.',
      medicinalUses: [],
      commonIssues: ['Brown spots from inconsistent watering', 'Dropping leaves from stress'],
      co2Absorption: 15.0,
      oxygenProduction: 7.8,
      care: {
        lightRequirement: 'HIGH' as const,
        lightHours: 8,
        wateringFrequency: 'WEEKLY' as const,
        wateringAmount: '1L or until drainage',
        humidity: 65,
        tempMin: 18,
        tempMax: 24,
        soilType: 'Well-draining, slightly acidic potting mix',
        fertilizingFreq: 'Bi-weekly during growing season',
        repottingFreq: 'Every 2 years'
      }
    },
    {
      name: 'Spider Plant',
      scientificName: 'Chlorophytum comosum',
      family: 'Asparagaceae',
      commonNames: ['Airplane Plant', 'Spider Ivy'],
      difficulty: 'EASY' as const,
      size: 'SMALL' as const,
      purposes: ['DECORATIVE', 'AIR_FILTERING'] as const,
      climateZones: ['9a', '9b', '10a', '10b', '11'],
      images: [
        'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
      ],
      description: 'Easy-care plant that produces baby plantlets, perfect for propagation.',
      medicinalUses: [],
      commonIssues: ['Brown tips from fluoride in water', 'Pale leaves from too much sun'],
      co2Absorption: 6.5,
      oxygenProduction: 3.2,
      care: {
        lightRequirement: 'MEDIUM' as const,
        lightHours: 6,
        wateringFrequency: 'WEEKLY' as const,
        wateringAmount: '250ml',
        humidity: 55,
        tempMin: 16,
        tempMax: 24,
        soilType: 'Regular potting soil',
        fertilizingFreq: 'Monthly during growing season',
        repottingFreq: 'Every 1-2 years'
      }
    }
  ]

  console.log('🌿 Creating plants...')
  for (const plantData of plants) {
    const { care, ...plant } = plantData
    await prisma.plant.upsert({
      where: { scientificName: plant.scientificName },
      update: {},
      create: {
        ...plant,
        isVerified: true,
        care: {
          create: care
        }
      }
    })
  }

  // Create sample achievements
  const achievements = [
    {
      name: 'First Plant Parent',
      description: 'Add your first plant to your collection',
      icon: '🌱',
      points: 50,
      conditions: { plantsOwned: { gte: 1 } }
    },
    {
      name: 'Plant Identifier',
      description: 'Successfully identify 10 plants',
      icon: '🔍',
      points: 100,
      conditions: { plantsIdentified: { gte: 10 } }
    },
    {
      name: 'Green Thumb',
      description: 'Maintain a 30-day care streak',
      icon: '👍',
      points: 200,
      conditions: { streak: { gte: 30 } }
    },
    {
      name: 'Plant Collector',
      description: 'Own 25 or more plants',
      icon: '🏆',
      points: 500,
      conditions: { plantsOwned: { gte: 25 } }
    },
    {
      name: 'Community Helper',
      description: 'Create 10 helpful posts',
      icon: '🤝',
      points: 150,
      conditions: { postsCreated: { gte: 10 } }
    }
  ]

  console.log('🏆 Creating achievements...')
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement
    })
  }

  // Create sample user plants for demo user
  const demoPlants = await prisma.plant.findMany({ take: 3 })
  
  console.log('🏡 Creating user plant collection...')
  for (const plant of demoPlants) {
    await prisma.userPlant.create({
      data: {
        userId: demoUser.id,
        plantId: plant.id,
        nickname: `My ${plant.name}`,
        notes: `This is my beloved ${plant.name}. Got it as a gift!`,
        location: 'Living Room',
        lastWatered: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        images: []
      }
    })
  }

  // Create sample posts
  console.log('📝 Creating community posts...')
  await prisma.post.create({
    data: {
      userId: demoUser.id,
      plantId: demoPlants[0]?.id,
      type: 'PLANT_SHOWCASE',
      title: 'My Monstera is thriving!',
      content: 'Look at these beautiful new leaves! 🌿 This plant has been with me for 6 months and it\'s growing so fast. Any tips for supporting the aerial roots?',
      tags: ['monstera', 'growth', 'success'],
      images: []
    }
  })

  await prisma.post.create({
    data: {
      userId: adminUser.id,
      type: 'HELP_REQUEST',
      title: 'Brown spots on snake plant leaves',
      content: 'Hi everyone! I\'ve noticed some brown spots appearing on my snake plant leaves. The plant is in bright, indirect light and I water it every 2 weeks. Any ideas what could be causing this?',
      tags: ['snakeplant', 'help', 'brownspots'],
      images: []
    }
  })

  console.log('✅ Seed completed successfully!')
  console.log(`
🌱 Sample Data Created:
   👤 Users: 2 (admin@greenmate.app, demo@greenmate.app)
   🌿 Plants: ${plants.length}
   🏆 Achievements: ${achievements.length}
   🏡 User Plants: ${demoPlants.length}
   📝 Posts: 2
   
🔐 Demo Credentials:
   Email: demo@greenmate.app
   Password: password123
   
🔧 Admin Credentials:
   Email: admin@greenmate.app  
   Password: password123
`)
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })