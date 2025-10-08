import { PrismaClient } from '@greenmate/database'

const prisma = new PrismaClient()

interface CreateListingData {
  userId: string
  plantId?: string
  title: string
  description: string
  price: number
  images: string[]
  location?: string
}

interface ListingFilters {
  plantId?: string
  minPrice?: number
  maxPrice?: number
  location?: string
  isActive?: boolean
  userId?: string
  limit?: number
  offset?: number
  sortBy?: 'price' | 'date' | 'title'
  sortOrder?: 'asc' | 'desc'
}

interface CreatePurchaseData {
  buyerId: string
  listingId: string
  amount: number
}

export class MarketplaceService {

  async createListing(data: CreateListingData) {
    try {
      const listing = await prisma.marketplaceListing.create({
        data: {
          userId: data.userId,
          plantId: data.plantId,
          title: data.title,
          description: data.description,
          price: data.price,
          images: data.images,
          location: data.location,
          isActive: true,
          isSold: false
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
              scientificName: true,
              images: true
            }
          }
        }
      })

      return listing
    } catch (error) {
      console.error('Create listing error:', error)
      throw new Error('Failed to create listing')
    }
  }

  async getListings(filters: ListingFilters = {}) {
    try {
      const {
        plantId,
        minPrice,
        maxPrice,
        location,
        isActive = true,
        userId,
        limit = 20,
        offset = 0,
        sortBy = 'date',
        sortOrder = 'desc'
      } = filters

      const where: any = { 
        isActive,
        isSold: false 
      }

      if (plantId) where.plantId = plantId
      if (userId) where.userId = userId
      if (location) where.location = { contains: location, mode: 'insensitive' }
      
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {}
        if (minPrice !== undefined) where.price.gte = minPrice
        if (maxPrice !== undefined) where.price.lte = maxPrice
      }

      const orderBy: any = {}
      switch (sortBy) {
        case 'price':
          orderBy.price = sortOrder
          break
        case 'title':
          orderBy.title = sortOrder
          break
        case 'date':
        default:
          orderBy.createdAt = sortOrder
          break
      }

      const listings = await prisma.marketplaceListing.findMany({
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
              scientificName: true,
              images: true
            }
          }
        },
        orderBy,
        take: limit,
        skip: offset
      })

      return listings
    } catch (error) {
      console.error('Get listings error:', error)
      throw new Error('Failed to fetch listings')
    }
  }

  async getListingById(listingId: string) {
    try {
      const listing = await prisma.marketplaceListing.findUnique({
        where: { id: listingId },
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
              images: true,
              care: true
            }
          },
          purchases: {
            include: {
              buyer: {
                select: {
                  id: true,
                  username: true,
                  profile: {
                    select: {
                      firstName: true,
                      lastName: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!listing) {
        throw new Error('Listing not found')
      }

      return listing
    } catch (error) {
      console.error('Get listing error:', error)
      throw new Error('Failed to fetch listing')
    }
  }

  async updateListing(listingId: string, userId: string, updates: Partial<CreateListingData>) {
    try {
      // Verify the listing belongs to the user
      const existingListing = await prisma.marketplaceListing.findFirst({
        where: { id: listingId, userId }
      })

      if (!existingListing) {
        throw new Error('Listing not found or not owned by user')
      }

      const updatedListing = await prisma.marketplaceListing.update({
        where: { id: listingId },
        data: updates,
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
          }
        }
      })

      return updatedListing
    } catch (error) {
      console.error('Update listing error:', error)
      throw new Error('Failed to update listing')
    }
  }

  async deactivateListing(listingId: string, userId: string) {
    try {
      const updatedListing = await prisma.marketplaceListing.updateMany({
        where: { id: listingId, userId },
        data: { isActive: false }
      })

      if (updatedListing.count === 0) {
        throw new Error('Listing not found or not owned by user')
      }

      return { success: true }
    } catch (error) {
      console.error('Deactivate listing error:', error)
      throw new Error('Failed to deactivate listing')
    }
  }

  async createPurchase(data: CreatePurchaseData) {
    try {
      // Check if listing is available
      const listing = await prisma.marketplaceListing.findUnique({
        where: { id: data.listingId }
      })

      if (!listing) {
        throw new Error('Listing not found')
      }

      if (!listing.isActive || listing.isSold) {
        throw new Error('Listing is not available')
      }

      if (listing.userId === data.buyerId) {
        throw new Error('Cannot purchase your own listing')
      }

      const purchase = await prisma.purchase.create({
        data: {
          buyerId: data.buyerId,
          listingId: data.listingId,
          amount: data.amount,
          status: 'pending'
        },
        include: {
          buyer: {
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
          listing: {
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
              }
            }
          }
        }
      })

      return purchase
    } catch (error) {
      console.error('Create purchase error:', error)
      throw new Error('Failed to create purchase')
    }
  }

  async getPurchases(userId: string, type: 'buyer' | 'seller' = 'buyer') {
    try {
      const purchases = await prisma.purchase.findMany({
        where: type === 'buyer' 
          ? { buyerId: userId }
          : { listing: { userId } },
        include: {
          buyer: {
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
          listing: {
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
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return purchases
    } catch (error) {
      console.error('Get purchases error:', error)
      throw new Error('Failed to fetch purchases')
    }
  }

  async updatePurchaseStatus(purchaseId: string, status: 'pending' | 'completed' | 'cancelled', userId: string) {
    try {
      // Verify the purchase involves the user (as buyer or seller)
      const purchase = await prisma.purchase.findUnique({
        where: { id: purchaseId },
        include: {
          listing: {
            select: { userId: true }
          }
        }
      })

      if (!purchase) {
        throw new Error('Purchase not found')
      }

      if (purchase.buyerId !== userId && purchase.listing.userId !== userId) {
        throw new Error('Not authorized to update this purchase')
      }

      const updatedPurchase = await prisma.purchase.update({
        where: { id: purchaseId },
        data: { status },
        include: {
          buyer: {
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
          listing: {
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
              }
            }
          }
        }
      })

      // If completed, mark listing as sold
      if (status === 'completed') {
        await prisma.marketplaceListing.update({
          where: { id: purchase.listingId },
          data: { isSold: true, isActive: false }
        })
      }

      return updatedPurchase
    } catch (error) {
      console.error('Update purchase status error:', error)
      throw new Error('Failed to update purchase status')
    }
  }

  async createReview(data: {
    reviewerId: string
    targetType: 'seller' | 'buyer' | 'plant'
    targetId: string
    rating: number
    comment?: string
  }) {
    try {
      const review = await prisma.review.create({
        data: {
          reviewerId: data.reviewerId,
          targetType: data.targetType,
          targetId: data.targetId,
          rating: data.rating,
          comment: data.comment
        },
        include: {
          reviewer: {
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

      return review
    } catch (error) {
      console.error('Create review error:', error)
      throw new Error('Failed to create review')
    }
  }

  async getReviews(targetId: string, targetType: string) {
    try {
      const reviews = await prisma.review.findMany({
        where: { targetId, targetType },
        include: {
          reviewer: {
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
        },
        orderBy: { createdAt: 'desc' }
      })

      return reviews
    } catch (error) {
      console.error('Get reviews error:', error)
      throw new Error('Failed to fetch reviews')
    }
  }

  async getMarketplaceStats() {
    try {
      const totalListings = await prisma.marketplaceListing.count({
        where: { isActive: true, isSold: false }
      })

      const totalSold = await prisma.marketplaceListing.count({
        where: { isSold: true }
      })

      const totalUsers = await prisma.user.count({
        where: {
          listings: {
            some: {}
          }
        }
      })

      const avgPrice = await prisma.marketplaceListing.aggregate({
        where: { isActive: true, isSold: false },
        _avg: {
          price: true
        }
      })

      return {
        totalListings,
        totalSold,
        totalUsers,
        averagePrice: avgPrice._avg.price || 0
      }
    } catch (error) {
      console.error('Get marketplace stats error:', error)
      throw new Error('Failed to fetch marketplace stats')
    }
  }
}

export const marketplaceService = new MarketplaceService()