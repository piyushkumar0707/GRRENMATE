import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    avatar: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    location: {
      city: String,
      country: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      default: 'beginner'
    },
    interests: [{
      type: String,
      enum: ['houseplants', 'outdoor_gardening', 'succulents', 'herbs', 'flowers', 'vegetables', 'trees']
    }]
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      reminders: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      profileVisible: {
        type: Boolean,
        default: true
      },
      plantsVisible: {
        type: Boolean,
        default: true
      }
    }
  },
  gamification: {
    points: {
      type: Number,
      default: 0
    },
    streak: {
      current: {
        type: Number,
        default: 0
      },
      longest: {
        type: Number,
        default: 0
      },
      lastActivity: Date
    },
    badges: [{
      name: String,
      earnedAt: {
        type: Date,
        default: Date.now
      },
      description: String
    }],
    level: {
      type: Number,
      default: 1
    },
    joinedDate: {
      type: Date,
      default: Date.now
    }
  },
  plants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserPlant'
  }],
  recognitionHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recognition'
  }],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Indexes for performance
userSchema.index({ email: 1 })
userSchema.index({ username: 1 })
userSchema.index({ 'gamification.points': -1 })
userSchema.index({ createdAt: -1 })

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next()
  }
  
  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}

// Get user's full name
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName || ''} ${this.profile.lastName || ''}`.trim()
})

// Get user's plant count
userSchema.virtual('plantCount').get(function() {
  return this.plants.length
})

// Get user's follower count
userSchema.virtual('followerCount').get(function() {
  return this.followers.length
})

// Get user's following count
userSchema.virtual('followingCount').get(function() {
  return this.following.length
})

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password
    delete ret.emailVerificationToken
    delete ret.passwordResetToken
    delete ret.__v
    return ret
  }
})

const User = mongoose.model('User', userSchema)

export default User