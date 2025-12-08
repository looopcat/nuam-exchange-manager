# NUAM Exchange Frontend - Setup & Running Guide

## Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── Login.jsx          # Login page component
│   │   ├── Login.css          # Login styles
│   │   ├── OperadorDashboard.jsx   # Operator dashboard
│   │   ├── OperadorDashboard.css   # Operator dashboard styles
│   │   ├── AdminDashboard.jsx      # Admin dashboard
│   │   └── AdminDashboard.css      # Admin dashboard styles
│   ├── services/
│   │   └── api.js             # Centralized API service layer
│   ├── App.jsx                # Main app component with routing logic
│   ├── App.css                # Global styles
│   └── main.jsx               # Vite entry point
├── index.html                 # HTML template
├── vite.config.js             # Vite configuration
└── package.json               # Dependencies and scripts
```

## Prerequisites
- Node.js 16+ (check: `node --version`)
- npm (comes with Node.js)
- Backend FastAPI server running on `http://localhost:8000`

## Installation & Running

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
- Server runs on `http://localhost:5173`
- Browser should open automatically
- Hot module reload enabled (changes refresh instantly)

### 3. Build for Production
```bash
npm run build
```
- Creates optimized build in `frontend/dist/`

### 4. Preview Production Build
```bash
npm run preview
```

## Features Implemented

### Login Page (Login.jsx)
- Username/password authentication
- Error handling with user feedback
- Test credentials display
- Stores session token in localStorage
- Responsive design

### Operator Dashboard (OperadorDashboard.jsx)
- **Place Orders**: Compra/Venta, specify instrument, quantity, limit price
- **Order History**: View all past orders with status
- **Real-time Updates**: Refresh orders after placement
- User info display in header
- Logout functionality

### Admin Dashboard (AdminDashboard.jsx)
- **Tab 1 - Transaction Reports**: View all executed transactions across exchanges
- **Tab 2 - Configure Tarifas**: Set market rates (CL, PE, CO)
- View current tariff rates in card layout
- Admin-only features with role verification
- Comprehensive transaction details

### API Service Layer (services/api.js)
Three main API groups:
- **authAPI**: login, logout, health check
- **ordenesAPI**: placeOrder, getOrders
- **adminAPI**: getReports, configureTarifas, getTarifas

All methods:
- Handle session token automatically
- Include error handling
- Return structured responses

## Development Workflow

### Adding a New Endpoint
1. Add method to appropriate API group in `services/api.js`
2. Use it in component: `const response = await ordenesAPI.methodName(...)`
3. Handle response with `.success` check and `.message` display

### Styling
- Global styles in `App.css`
- Component-specific styles in matching `.css` files
- Uses CSS Grid/Flexbox for responsive layouts
- Gradient colors: `#667eea` to `#764ba2`

### State Management
- Uses React hooks (useState, useEffect)
- Session data in localStorage for persistence
- Component-level state for forms and lists
- No external state management library needed

## Troubleshooting

### "Cannot GET /api/..." or CORS errors
- Verify backend is running: `curl http://localhost:8000/health`
- Check backend CORS config includes `http://localhost:5173`
- Check Network tab in browser DevTools

### Session token not working
- Check localStorage in browser DevTools (F12 → Application → LocalStorage)
- Ensure key is `session_token` and value exists
- Check if token was returned from login response

### npm install fails
- Delete `node_modules/` and `package-lock.json`
- Run `npm cache clean --force`
- Run `npm install` again

### Port 5173 already in use
- Kill process on port 5173: `netstat -ano | findstr :5173` (Windows)
- Or set different port in `vite.config.js`: `port: 5174`

## Testing Credentials
- **Operator**: MirtaAguilar / 1234
- **Admin**: GabrielFuentes / admin

## Key Dependencies
- **React 18.2**: UI framework
- **Vite 5**: Build tool and dev server
- No external UI component library (custom CSS)
- No state management library (React hooks)
