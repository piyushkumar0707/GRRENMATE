import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  })
}

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { username, email, password, firstName, lastName } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      })
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      profile: {
        firstName,
        lastName
      }
    })

    // Generate token
    const token = generateToken(user._id)

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profile: user.profile,
          gamification: user.gamification
        },
        token
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      })
    }

    // Check for user and include password
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      })
    }

    // Generate token
    const token = generateToken(user._id)

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profile: user.profile,
          gamification: user.gamification,
          lastLogin: user.lastLogin
        },
        token
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('plants', 'nickname images health')
      .select('-password')

    res.status(200).json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {}
    const allowedFields = [
      'profile.firstName',
      'profile.lastName',
      'profile.bio',
      'profile.location',
      'profile.experience',
      'profile.interests'
    ]

    // Build update object
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key) || key.startsWith('profile.')) {
        fieldsToUpdate[key] = req.body[key]
      }
    })

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update user preferences
// @route   PUT /api/auth/preferences
// @access  Private
const updatePreferences = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferences: req.body },
      { new: true, runValidators: true }
    )

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      })
    }

    // Get user with password
    const user = await User.findById(req.user.id).select('+password')

    // Check current password
    const isMatch = await user.comparePassword(currentPassword)

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    next(error)
  }
}

// Routes
router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, getMe)
router.put('/profile', protect, updateProfile)
router.put('/preferences', protect, updatePreferences)
router.put('/password', protect, changePassword)

export default router