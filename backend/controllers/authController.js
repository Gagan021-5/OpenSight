import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'opensight-dev-secret-change-in-production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function toSafeUser(user) {
  return {
    id: user._id,
    email: user.email,
    name: user.name,
    ageGroup: user.ageGroup,
    language: user.language,
    config: user.config,
  };
}

/**
 * POST /auth/register
 * Body: { email, password, name, ageGroup?, config? }
 */
export const register = async (req, res) => {
  try {
    const { email, password, name, ageGroup, config } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const user = new User({
      email: email.toLowerCase(),
      password,
      name: (name || '').trim() || 'User',
      ageGroup: ageGroup === 'kid' ? 'kid' : 'adult',
      config: config || { weakEye: 'left', condition: 'amblyopia', difficulty: 5 },
    });
    await user.save();
    const token = signToken(user._id);
    res.status(201).json({ token, user: toSafeUser(user) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

/**
 * POST /auth/login
 * Body: { email, password }
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = signToken(user._id);
    const safe = toSafeUser(user);
    res.json({ token, user: safe });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};
