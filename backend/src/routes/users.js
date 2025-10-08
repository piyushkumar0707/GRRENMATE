import express from 'express'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @desc    Get user stats/dashboard data
// @route   GET /api/users/stats
// @access  Private
const getUserStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)

    // Mock stats for demonstration
    const stats = {
      totalPlants: user.plants.length,
      identifiedToday: 3,
      needWater: 2,
      healthyPlants: 10,
      points: user.gamification.points,
      streak: user.gamification.streak.current,
      level: user.gamification.level,
      badges: user.gamification.badges.length,
      joinedDate: user.gamification.joinedDate
    }

    res.status(200).json({
      success: true,
      data: stats
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
const getLeaderboard = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query

    const topUsers = await User.find({ isActive: true })
      .select('username profile.firstName profile.lastName profile.avatar gamification.points gamification.level')
      .sort('-gamification.points')
      .limit(parseInt(limit))

    res.status(200).json({
      success: true,
      data: topUsers
    })
  } catch (error) {
    next(error)
  }
}

// Routes
router.get('/stats', protect, getUserStats)
router.get('/leaderboard', getLeaderboard)

export default router