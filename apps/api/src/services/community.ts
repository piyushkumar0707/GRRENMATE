import { PrismaClient } from '@greenmate/database'

const prisma = new PrismaClient()

interface CreatePostData {
  userId: string
  plantId?: string
  type: 'GENERAL' | 'HELP_REQUEST' | 'SUCCESS_STORY' | 'PLANT_SHOWCASE'
  title?: string
  content: string
  images?: string[]
  tags?: string[]
}

interface CreateCommentData {
  userId: string
  postId: string
  content: string
  parentId?: string
}

export class CommunityService {
  
  // Posts
  async createPost(data: CreatePostData) {
    try {
      const post = await prisma.post.create({
        data: {
          userId: data.userId,
          plantId: data.plantId,
          type: data.type,
          title: data.title,
          content: data.content,
          images: data.images || [],
          tags: data.tags || []
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          },
          plant: {
            select: {
              id: true,
              name: true,
              scientificName: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        }
      })

      return post
    } catch (error) {
      console.error('Create post error:', error)
      throw new Error('Failed to create post')
    }
  }

  async getPosts(filters: {
    type?: string
    plantId?: string
    userId?: string
    tags?: string[]
    limit?: number
    offset?: number
  } = {}) {
    try {
      const { type, plantId, userId, tags, limit = 20, offset = 0 } = filters

      const where: any = { isPublished: true }
      
      if (type) where.type = type
      if (plantId) where.plantId = plantId
      if (userId) where.userId = userId
      if (tags && tags.length > 0) {
        where.tags = { hasSome: tags }
      }

      const posts = await prisma.post.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          },
          plant: {
            select: {
              id: true,
              name: true,
              scientificName: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      })

      return posts
    } catch (error) {
      console.error('Get posts error:', error)
      throw new Error('Failed to fetch posts')
    }
  }

  async getPostById(postId: string, userId?: string) {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          },
          plant: {
            select: {
              id: true,
              name: true,
              scientificName: true,
              images: true
            }
          },
          comments: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true,
                      avatar: true
                    }
                  }
                }
              },
              replies: {
                include: {
                  user: {
                    select: {
                      id: true,
                      username: true,
                      profile: {
                        select: {
                          firstName: true,
                          lastName: true,
                          avatar: true
                        }
                      }
                    }
                  }
                }
              }
            },
            where: { parentId: null },
            orderBy: { createdAt: 'asc' }
          },
          likes: userId ? {
            where: { userId }
          } : false,
          _count: {
            select: {
              likes: true,
              comments: true
            }
          }
        }
      })

      if (!post) {
        throw new Error('Post not found')
      }

      return {
        ...post,
        isLiked: userId ? post.likes && post.likes.length > 0 : false,
        likes: undefined
      }
    } catch (error) {
      console.error('Get post error:', error)
      throw new Error('Failed to fetch post')
    }
  }

  // Comments
  async createComment(data: CreateCommentData) {
    try {
      const comment = await prisma.comment.create({
        data: {
          userId: data.userId,
          postId: data.postId,
          content: data.content,
          parentId: data.parentId
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            }
          }
        }
      })

      return comment
    } catch (error) {
      console.error('Create comment error:', error)
      throw new Error('Failed to create comment')
    }
  }

  // Likes
  async toggleLike(userId: string, postId: string) {
    try {
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_postId: { userId, postId }
        }
      })

      if (existingLike) {
        await prisma.like.delete({
          where: { id: existingLike.id }
        })
        return { liked: false }
      } else {
        await prisma.like.create({
          data: { userId, postId }
        })
        return { liked: true }
      }
    } catch (error) {
      console.error('Toggle like error:', error)
      throw new Error('Failed to toggle like')
    }
  }

  // Following
  async followUser(followerId: string, followingId: string) {
    try {
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: { followerId, followingId }
        }
      })

      if (existingFollow) {
        await prisma.follow.delete({
          where: { id: existingFollow.id }
        })
        return { following: false }
      } else {
        await prisma.follow.create({
          data: { followerId, followingId }
        })
        return { following: true }
      }
    } catch (error) {
      console.error('Follow user error:', error)
      throw new Error('Failed to follow user')
    }
  }

  async getUserProfile(userId: string, currentUserId?: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          _count: {
            select: {
              posts: true,
              followers: true,
              following: true,
              userPlants: true
            }
          },
          followers: currentUserId ? {
            where: { followerId: currentUserId }
          } : false
        }
      })

      if (!user) {
        throw new Error('User not found')
      }

      return {
        ...user,
        isFollowing: currentUserId ? user.followers && user.followers.length > 0 : false,
        followers: undefined
      }
    } catch (error) {
      console.error('Get user profile error:', error)
      throw new Error('Failed to fetch user profile')
    }
  }

  async getTrendingTags(limit = 10) {
    try {
      // Get all posts from the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const posts = await prisma.post.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          isPublished: true
        },
        select: { tags: true }
      })

      // Count tag frequencies
      const tagCounts: { [key: string]: number } = {}
      posts.forEach(post => {
        post.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      })

      // Sort by frequency and return top tags
      const sortedTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([tag, count]) => ({ tag, count }))

      return sortedTags
    } catch (error) {
      console.error('Get trending tags error:', error)
      throw new Error('Failed to fetch trending tags')
    }
  }

  async getExperts(limit = 10) {
    try {
      const experts = await prisma.user.findMany({
        include: {
          profile: true,
          _count: {
            select: {
              posts: true,
              followers: true,
              userPlants: true
            }
          }
        },
        orderBy: [
          { posts: { _count: 'desc' } },
          { followers: { _count: 'desc' } }
        ],
        take: limit
      })

      return experts.filter(user => 
        user._count.posts > 5 && user._count.userPlants > 3
      )
    } catch (error) {
      console.error('Get experts error:', error)
      throw new Error('Failed to fetch experts')
    }
  }
}

export const communityService = new CommunityService()