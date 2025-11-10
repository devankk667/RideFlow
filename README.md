# RideFlow - Smart Ridesharing Platform

A complete, production-ready frontend for a modern ridesharing platform built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Multi-Role System
- **Passengers**: Book rides, track drivers, manage payments, view history
- **Drivers**: Accept requests, manage earnings, vehicle management
- **Admins**: Platform analytics, user management, incident reports

### Key Highlights
- 🎨 Modern glassmorphism design with smooth animations
- 🌙 Dark mode support
- 📱 Fully responsive (mobile-first design)
- 🔒 Role-based authentication & protected routes
- 🗺️ Live ride tracking simulation
- 💳 Complete payment system with wallet
- ⭐ Rating & feedback system
- 🎯 Real-time notifications
- 📊 Admin analytics dashboard
- 🚗 Multiple vehicle types (Bike, Auto, Car, SUV, Luxury)

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🧪 Demo Accounts

Use these credentials to test different roles:

**Passenger Account:**
- Email: `passenger@demo.com`
- Password: `password123`

**Driver Account:**
- Email: `driver@demo.com`
- Password: `password123`

**Admin Account:**
- Email: `admin@rideflow.com`
- Password: `admin123`

## 🏗️ Project Structure

```
src/
├── components/        # Reusable UI components
│   └── ui/           # Base components (Button, Input, Card, etc.)
├── pages/            # Page components
│   ├── auth/         # Login & Signup
│   ├── passenger/    # Passenger dashboard & features
│   ├── driver/       # Driver dashboard & features
│   └── admin/        # Admin dashboard & management
├── stores/           # Zustand state management
│   ├── authStore.ts
│   ├── rideStore.ts
│   ├── notificationStore.ts
│   └── toastStore.ts
├── data/             # Mock data generation
│   └── mockData.ts   # 50+ passengers, 30+ drivers, 100+ rides
├── types/            # TypeScript type definitions
│   └── index.ts
├── utils/            # Helper functions
│   └── helpers.ts
└── App.tsx           # Main app with routing

```

## 🎯 Core Features Implemented

### Passenger Features
- ✅ Dashboard with quick ride booking
- ✅ Live ride tracking with ETA
- ✅ Ride history with filters
- ✅ Payment methods management
- ✅ Digital wallet with recharge
- ✅ Promo codes system
- ✅ Profile management
- ✅ Rating system

### Driver Features
- ✅ Dashboard with ride requests
- ✅ Accept/decline rides
- ✅ Earnings tracking (daily/weekly/monthly)
- ✅ Vehicle management
- ✅ Driver profile & ratings
- ✅ Online/offline toggle

### Admin Features
- ✅ Platform statistics dashboard
- ✅ User management (suspend/activate)
- ✅ Ride monitoring
- ✅ Transaction logs
- ✅ Promo code management
- ✅ Incident reports
- ✅ Analytics charts

## 🎨 Design System

### Colors
- **Primary**: Blue to Purple gradient (#667eea → #764ba2)
- **Accent**: Electric Cyan (#06b6d4)
- **Success**: Blue to Cyan gradient

### Components
- Glassmorphism effects for modern UI
- Smooth animations with Framer Motion
- Toast notifications for user feedback
- Loading skeletons for better UX
- Responsive navigation (sidebar + mobile menu)

## 📊 Mock Data

The application includes realistic mock data:
- 55 Passengers with unique Indian names
- 35 Drivers with verified vehicles
- 120 Completed rides
- 35 Vehicles (Bikes, Autos, Cars, SUVs, Luxury)
- Payment transactions
- 6 Promo codes (active & expired)
- 8 Incident reports
- 15 Traffic reports
- Real-time notifications

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom theme
- **Routing**: React Router v6
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Maps**: Leaflet (for ride tracking)

## 🚀 Getting Started

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Open `http://localhost:5173` in your browser
5. Use demo accounts to explore different roles

## 📱 Responsive Breakpoints

- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px - 1439px
- Large Desktop: 1440px+

## 🎭 Demo Mode Features

- Auto-play ride journey simulation
- Real-time ETA countdown
- Location updates during ride
- Fare meter animation
- Success celebrations on completion
- Confetti animation on first ride

## 🔐 Security Features

- Role-based access control
- Protected routes
- Password visibility toggle
- Form validation
- Session persistence

## 🎨 UI/UX Highlights

- Smooth page transitions
- Loading states for all actions
- Error handling with friendly messages
- Toast notifications for feedback
- Skeleton loaders
- Hover effects on interactive elements
- Micro-interactions throughout
- Accessibility features (ARIA labels, keyboard navigation)

## 📝 Notes

- All data is mocked - no backend required
- Fully functional demo without external APIs
- Uses local storage for auth persistence
- Simulated real-time updates using intervals

## 🤝 Contributing

This is a demo project showcasing a complete ridesharing platform frontend. Feel free to use it as a template or learning resource!

## 📄 License

MIT License - feel free to use this project for learning or as a starting point for your own applications.

---

Built with ❤️ for demonstrating modern React + TypeScript + Tailwind development.
