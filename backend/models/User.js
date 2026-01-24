import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  ageGroup: {
    type: String,
    enum: ['kid', 'adult'],
    default: 'adult',
  },
  config: {
    weakEye: {
      type: String,
      enum: ['left', 'right', 'both'],
      default: 'left',
    },
    condition: {
      type: String,
      enum: ['amblyopia', 'strabismus', 'convergence', 'tracking', 'neglect'],
      default: 'amblyopia',
    },
    difficulty: {
      type: Number,
      min: 1,
      max: 10,
      default: 5,
    },
  },
  scores: [
    {
      game: { type: String, required: true },
      score: { type: Number, required: true },
      duration: { type: Number, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.addScore = function (game, score, duration) {
  this.scores.push({ game, score, duration, date: new Date() });
  return this.save();
};

const User = mongoose.model('User', userSchema);
export default User;
