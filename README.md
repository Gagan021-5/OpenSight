# OpenSight - Vision Therapy Platform

OpenSight is a free MERN stack vision therapy platform that gamifies medical exercises for conditions like Amblyopia, Strabismus, Convergence Insufficiency, Tracking, and Spatial Neglect.

## 🎯 Core Features

### Three-Mode Vision System
The platform implements a sophisticated color-based therapy system:

- **Left Eye Weak**: Target (Red) / Background (Blue)
- **Right Eye Weak**: Target (Blue) / Background (Red)  
- **Both Eyes Weak (Fusion Mode)**: Target (Purple) / Background (Black/Grey)
  - Purple forces binocular fusion as it appears dark to both eyes through red/blue glasses

### Dual Persona UI
- **Kids Mode**: Playful UI with mission themes, badges, Comic Sans/Nunito fonts
- **Adults Mode**: Clean clinical dashboard with progress tracking

## 🏗️ Architecture

### Stack
- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: Clerk (JWT-based session management)
- **Routing**: React Router v6

### Project Structure
```
therapy/
├── backend/
│   ├── models/
│   │   └── User.js          # MongoDB User schema
│   ├── server.js            # Express API server
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/      # Game components
    │   ├── context/         # GlobalContext
    │   ├── hooks/           # useTherapyColors
    │   ├── pages/           # Auth & Dashboard pages
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── .env.example
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Clerk account (free tier available)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Setup Clerk Authentication

1. Go to [clerk.com](https://clerk.com) and create a free account
2. Create a new application
3. Copy your **Publishable Key** and **Secret Key**

### 3. Configure Environment Variables

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/opensight
PORT=5000

# Clerk Configuration
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_API_URL=http://localhost:5000/api
```

### 4. Start MongoDB

```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGO_URI in backend/.env with your Atlas connection string
```

### 5. Run the Application

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:5000`

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

## 📝 User Flow

1. **Sign Up** → Create account via Clerk
2. **Setup Profile** → Configure:
   - Weak eye (left/right/both)
   - Condition type
   - Starting difficulty
3. **Dashboard** → Choose therapy game
4. **Play Games** → Scores auto-save to MongoDB
5. **Track Progress** → View stats and achievements

## 🎮 Games

### Current Games
- **Snake Hunt** - Amblyopia training
- **Speed Racer** - Tracking & amblyopia
- **Sea Voyage** - Eye coordination

### Planned Games
- **Convergence Trainer** - Zooming targets for fusion
- **Tetris Mode** - Strabismus exercises
- **Whack-a-Mole** - Tracking disorder
- **Lighthouse** - Spatial neglect rehabilitation

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/sync` - Sync Clerk user to MongoDB
- `GET /api/auth/me` - Get current user profile

### User Management
- `PATCH /api/user/config` - Update therapy configuration

### Scores & Stats
- `POST /api/scores` - Submit game score
- `GET /api/scores` - Get user scores
- `GET /api/stats/:gameType?` - Get statistics

## 🧪 Development

### Backend Development
```bash
cd backend
npm run dev  # Uses node --watch for hot reload
```

### Frontend Development
```bash
cd frontend
npm run dev  # Vite hot reload enabled
```

### Database Schema

```javascript
User {
  clerkId: String (unique, indexed)
  email: String
  name: String
  ageGroup: 'kid' | 'adult'
  config: {
    weakEye: 'left' | 'right' | 'both'
    condition: 'amblyopia' | 'strabismus' | 'convergence' | 'tracking' | 'neglect'
    difficulty: Number (1-10)
  }
  scores: [{
    gameType: String
    score: Number
    duration: Number
    difficulty: Number
    timestamp: Date
  }]
}
```

## 🎨 Customization

### Adding New Games

1. Create game component in `frontend/src/components/`
2. Use `useTherapyColors(weakEye, intensity)` hook
3. Import `useGlobal()` for user config
4. Add route in `App.jsx`
5. Add game card in `Dashboard.jsx`

Example:
```javascript
import useTherapyColors from '../hooks/useTherapyColors';
import { useGlobal } from '../context/GlobalContext';

const MyGame = () => {
  const { weakEye, difficulty, submitScore } = useGlobal();
  const colors = useTherapyColors(weakEye, 0.8);
  
  // colors.target = Red/Blue/Purple based on weakEye
  // colors.lock = Background color
  // colors.background = Canvas background
};
```

## 🔒 Security

- All routes protected by Clerk authentication
- JWT tokens verified on backend
- MongoDB uses Clerk userId for authorization
- No passwords stored locally (handled by Clerk)

## 📄 License

MIT License - Free for personal and commercial use

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📧 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ for vision therapy professionals and patients**
