import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  ageGroup: {
    type: String,
    enum: ['kid', 'adult'],
    default: 'adult'
  },
  config: {
    weakEye: {
      type: String,
      enum: ['left', 'right', 'both'],
      default: 'left'
    },
    condition: {
      type: String,
      enum: ['amblyopia', 'strabismus', 'convergence', 'tracking', 'neglect'],
      default: 'amblyopia'
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 10,
      default: 5
    }
  },
  scores: [{
    gameType: {
      type: String,
      enum: ['snake', 'racing', 'sea', 'convergence', 'strabismus', 'tracking', 'neglect'],
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    duration: {
      type: Number, // Duration in seconds
      required: true
    },
    difficulty: {
      type: Number,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Static method to find or create user from Clerk data
userSchema.statics.findOrCreateFromClerk = async function(clerkUser) {
  let user = await this.findOne({ clerkId: clerkUser.id });
  
  if (!user) {
    user = await this.create({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress,
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User',
      ageGroup: clerkUser.publicMetadata?.ageGroup || 'adult',
      config: {
        weakEye: clerkUser.publicMetadata?.weakEye || 'left',
        condition: clerkUser.publicMetadata?.condition || 'amblyopia',
        difficulty: clerkUser.publicMetadata?.difficulty || 5
      }
    });
  }
  
  return user;
};

// Method to add score
userSchema.methods.addScore = function(gameData) {
  this.scores.push(gameData);
  return this.save();
};

// Method to get statistics
userSchema.methods.getStats = function(gameType) {
  const gameScores = gameType 
    ? this.scores.filter(s => s.gameType === gameType)
    : this.scores;
  
  if (gameScores.length === 0) return null;
  
  const scores = gameScores.map(s => s.score);
  return {
    totalGames: gameScores.length,
    highScore: Math.max(...scores),
    averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
    recentScores: gameScores.slice(-10).reverse()
  };
};

const User = mongoose.model('User', userSchema);

export default User;
