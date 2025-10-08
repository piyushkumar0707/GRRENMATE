import mongoose from 'mongoose'

const plantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plant name is required'],
    trim: true
  },
  scientificName: {
    type: String,
    required: [true, 'Scientific name is required'],
    unique: true,
    trim: true
  },
  commonNames: [{
    type: String,
    trim: true
  }],
  family: {
    type: String,
    required: [true, 'Plant family is required'],
    trim: true
  },
  genus: {
    type: String,
    trim: true
  },
  species: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    source: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  care: {
    sunlight: {
      type: String,
      enum: ['full_sun', 'partial_sun', 'partial_shade', 'full_shade', 'bright_indirect', 'low_light'],
      required: true
    },
    water: {
      frequency: {
        type: String,
        enum: ['daily', 'every_2_days', 'every_3_days', 'weekly', 'bi_weekly', 'monthly', 'seasonal']
      },
      amount: {
        type: String,
        enum: ['light', 'moderate', 'heavy']
      },
      method: {
        type: String,
        enum: ['top_watering', 'bottom_watering', 'misting', 'soaking']
      }
    },
    soil: {
      type: {
        type: String,
        enum: ['potting_mix', 'succulent_mix', 'orchid_bark', 'seed_starting_mix', 'african_violet_mix']
      },
      drainage: {
        type: String,
        enum: ['excellent', 'good', 'moderate', 'poor'],
        required: true
      },
      ph: {
        min: {
          type: Number,
          min: 0,
          max: 14
        },
        max: {
          type: Number,
          min: 0,
          max: 14
        }
      }
    },
    temperature: {
      min: {
        type: Number,
        required: true
      },
      max: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius'
      }
    },
    humidity: {
      min: {
        type: Number,
        min: 0,
        max: 100
      },
      max: {
        type: Number,
        min: 0,
        max: 100
      }
    },
    fertilizer: {
      frequency: {
        type: String,
        enum: ['weekly', 'bi_weekly', 'monthly', 'quarterly', 'seasonally', 'yearly']
      },
      type: {
        type: String,
        enum: ['balanced', 'high_nitrogen', 'high_phosphorus', 'high_potassium', 'organic']
      },
      season: [{
        type: String,
        enum: ['spring', 'summer', 'fall', 'winter']
      }]
    },
    repotting: {
      frequency: {
        type: String,
        enum: ['yearly', 'every_2_years', 'every_3_years', 'as_needed']
      },
      season: [{
        type: String,
        enum: ['spring', 'summer', 'fall', 'winter']
      }]
    },
    pruning: {
      frequency: {
        type: String,
        enum: ['monthly', 'seasonally', 'yearly', 'as_needed']
      },
      method: String
    }
  },
  characteristics: {
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'difficult', 'expert'],
      required: true
    },
    size: {
      mature: {
        height: {
          min: Number,
          max: Number,
          unit: {
            type: String,
            enum: ['cm', 'inches', 'feet', 'meters'],
            default: 'cm'
          }
        },
        width: {
          min: Number,
          max: Number,
          unit: {
            type: String,
            enum: ['cm', 'inches', 'feet', 'meters'],
            default: 'cm'
          }
        }
      },
      growthRate: {
        type: String,
        enum: ['slow', 'moderate', 'fast']
      }
    },
    lifespan: {
      type: String,
      enum: ['annual', 'biennial', 'perennial']
    },
    bloomTime: [{
      type: String,
      enum: ['spring', 'summer', 'fall', 'winter', 'year_round']
    }],
    flowerColor: [{
      type: String
    }],
    foliageType: {
      type: String,
      enum: ['deciduous', 'evergreen', 'semi_evergreen']
    },
    foliageColor: [{
      type: String
    }],
    toxicity: {
      pets: {
        type: Boolean,
        default: false
      },
      humans: {
        type: Boolean,
        default: false
      },
      details: String
    }
  },
  categories: [{
    type: String,
    enum: [
      'houseplant', 'outdoor_plant', 'succulent', 'herb', 'flower', 'vegetable', 
      'tree', 'shrub', 'vine', 'grass', 'fern', 'moss', 'air_plant',
      'air_purifying', 'medicinal', 'edible', 'aromatic', 'decorative'
    ]
  }],
  climate: {
    zones: [{
      type: String
    }],
    nativeRegions: [{
      type: String
    }],
    idealClimate: {
      type: String,
      enum: ['tropical', 'subtropical', 'temperate', 'mediterranean', 'arid', 'arctic']
    }
  },
  propagation: {
    methods: [{
      type: String,
      enum: ['seed', 'cutting', 'division', 'layering', 'grafting', 'bulb', 'offset']
    }],
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'difficult']
    },
    bestTime: [{
      type: String,
      enum: ['spring', 'summer', 'fall', 'winter']
    }]
  },
  commonIssues: [{
    problem: {
      type: String,
      required: true
    },
    causes: [{
      type: String
    }],
    solutions: [{
      type: String
    }],
    prevention: [{
      type: String
    }]
  }],
  diseases: [{
    name: {
      type: String,
      required: true
    },
    symptoms: [{
      type: String
    }],
    treatment: [{
      type: String
    }],
    prevention: [{
      type: String
    }]
  }],
  pests: [{
    name: {
      type: String,
      required: true
    },
    symptoms: [{
      type: String
    }],
    treatment: [{
      type: String
    }],
    prevention: [{
      type: String
    }]
  }],
  companions: [{
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant'
    },
    benefit: String
  }],
  sustainability: {
    co2Absorption: {
      type: Number, // kg per year
      default: 0
    },
    oxygenProduction: {
      type: Number, // liters per day
      default: 0
    },
    airPurification: {
      score: {
        type: Number,
        min: 0,
        max: 10
      },
      toxinsRemoved: [{
        type: String
      }]
    },
    waterEfficiency: {
      type: String,
      enum: ['very_low', 'low', 'moderate', 'high', 'very_high']
    }
  },
  identification: {
    leafShape: [{
      type: String
    }],
    leafArrangement: {
      type: String,
      enum: ['alternate', 'opposite', 'whorled', 'rosette']
    },
    leafMargin: {
      type: String,
      enum: ['entire', 'toothed', 'lobed', 'compound']
    },
    stemType: {
      type: String,
      enum: ['herbaceous', 'woody', 'succulent']
    },
    rootType: {
      type: String,
      enum: ['fibrous', 'taproot', 'aerial', 'storage']
    },
    uniqueFeatures: [{
      type: String
    }]
  },
  medicinalUses: [{
    use: {
      type: String,
      required: true
    },
    preparation: String,
    dosage: String,
    warnings: String
  }],
  edibleParts: [{
    part: {
      type: String,
      enum: ['leaves', 'fruits', 'flowers', 'stems', 'roots', 'seeds', 'bark']
    },
    preparation: String,
    taste: String,
    nutritionalValue: String
  }],
  culturalSignificance: {
    symbolism: [{
      culture: String,
      meaning: String
    }],
    traditionalUses: [{
      type: String
    }],
    folklore: String
  },
  sources: [{
    type: {
      type: String,
      enum: ['database', 'api', 'manual', 'community']
    },
    name: String,
    url: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  popularity: {
    viewCount: {
      type: Number,
      default: 0
    },
    recognitionCount: {
      type: Number,
      default: 0
    },
    ownedByUsers: {
      type: Number,
      default: 0
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  status: {
    type: String,
    enum: ['active', 'pending', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
})

// Indexes for performance
plantSchema.index({ scientificName: 1 })
plantSchema.index({ name: 1 })
plantSchema.index({ family: 1 })
plantSchema.index({ categories: 1 })
plantSchema.index({ 'characteristics.difficulty': 1 })
plantSchema.index({ 'care.sunlight': 1 })
plantSchema.index({ 'popularity.recognitionCount': -1 })
plantSchema.index({ status: 1 })

// Text index for search
plantSchema.index({
  name: 'text',
  scientificName: 'text',
  commonNames: 'text',
  family: 'text',
  description: 'text'
})

// Virtual for primary image
plantSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary)
  return primary || this.images[0] || null
})

// Ensure virtual fields are serialized
plantSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v
    return ret
  }
})

const Plant = mongoose.model('Plant', plantSchema)

export default Plant