const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Music', 'Food & Drink', 'Markets', 'Arts', 'Sports', 'Wellness', 'Other']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere' // Geospatial index for location-based queries
    }
  },
  price: {
    type: Number,
    default: 0 // 0 means free
  },
  currency: {
    type: String,
    default: 'USD'
  },
  image: {
    type: String,
    default: ''
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizerName: {
    type: String,
    required: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  maxAttendees: {
    type: Number,
    default: null
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['going', 'interested'],
      default: 'interested'
    },
    rsvpDate: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'published'
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
eventSchema.index({ 'location.coordinates': '2dsphere' });

// Index for text search
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Static method to find events within a radius
eventSchema.statics.findWithinRadius = function(longitude, latitude, radiusInKm, filters = {}) {
  const query = {
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radiusInKm * 1000 // Convert km to meters
      }
    },
    status: 'published',
    ...filters
  };

  return this.find(query).populate('organizer', 'name email');
};

// Static method to find events within bounding box (for map viewport)
eventSchema.statics.findWithinBounds = function(northEast, southWest, filters = {}) {
  const query = {
    'location.coordinates': {
      $geoWithin: {
        $box: [southWest, northEast]
      }
    },
    status: 'published',
    ...filters
  };

  return this.find(query).populate('organizer', 'name email');
};

// Instance method to get attendee count
eventSchema.methods.getAttendeeCount = function() {
  return this.attendees.filter(a => a.status === 'going').length;
};

// Instance method to check if user is attending
eventSchema.methods.isUserAttending = function(userId) {
  return this.attendees.some(a => a.user.toString() === userId.toString() && a.status === 'going');
};

// Instance method to check if user is interested
eventSchema.methods.isUserInterested = function(userId) {
  return this.attendees.some(a => a.user.toString() === userId.toString() && a.status === 'interested');
};

module.exports = mongoose.model('Event', eventSchema);
