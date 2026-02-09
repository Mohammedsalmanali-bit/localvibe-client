const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  location: {
    address: String,
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  preferences: {
    categories: [String],
    radius: {
      type: Number,
      default: 10 // Default search radius in km
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    }
  },
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isOrganizer: {
    type: Boolean,
    default: false
  },
  organizerProfile: {
    organizationName: String,
    description: String,
    website: String,
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String
    },
    verified: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get user's events
userSchema.methods.getEvents = function() {
  return mongoose.model('Event').find({ organizer: this._id });
};

// Get user's RSVP'd events
userSchema.methods.getRSVPEvents = function() {
  return mongoose.model('Event').find({
    'attendees.user': this._id
  });
};

// Get friends who are attending an event
userSchema.methods.getFriendsAttending = async function(eventId) {
  const event = await mongoose.model('Event').findById(eventId);
  if (!event) return [];
  
  const friendIds = this.following.filter(followId => 
    event.attendees.some(a => a.user.toString() === followId.toString() && a.status === 'going')
  );
  
  return mongoose.model('User').find({
    _id: { $in: friendIds }
  }).select('name avatar');
};

module.exports = mongoose.model('User', userSchema);
