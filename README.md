# LocalVibe - Hyperlocal Event Discovery Platform

LocalVibe is a full-stack web application that helps users discover and create local events in their community. From farmers markets to open mic nights, LocalVibe makes it easy to find what's happening near you.

![LocalVibe](https://images.unsplash.com/photo-1531058020387-3be344556be6?w=1200)

## Features

### For Event Attendees
- **Interactive Map**: Discover events on an interactive map with geolocation support
- **Event Discovery**: Browse events by category, date, price, and location
- **RSVP System**: Mark events as "Going" or "Interested"
- **Social Features**: See friends who are attending events
- **Search & Filter**: Find events that match your interests

### For Event Organizers
- **Event Creation**: Create events with address autocomplete
- **Ticket Management**: Set up free or paid tickets
- **Attendee Tracking**: Manage RSVPs and see who's coming
- **Featured Listings**: Premium placement for your events
- **Analytics**: Track event performance and engagement

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Leaflet** for interactive maps
- **React Router** for navigation

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Geospatial queries** with 2dsphere indexes
- **JWT** authentication
- **Express Validator** for input validation

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/localvibe.git
cd localvibe
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
```

4. Set up environment variables:

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/localvibe
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

5. Seed the database with sample data:
```bash
cd server
npm run seed
```

6. Start the development servers:

Backend:
```bash
cd server
npm run dev
```

Frontend (in a new terminal):
```bash
npm run dev
```

7. Open your browser and navigate to `http://localhost:5173`

## Demo Credentials

Use these credentials to test the application:

- **Email**: sarah@example.com
- **Password**: password123

Or create your own account!

## API Documentation

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (auth required)
- `PUT /api/events/:id` - Update event (auth required)
- `DELETE /api/events/:id` - Delete event (auth required)
- `POST /api/events/within-bounds` - Get events within map bounds

### RSVP
- `POST /api/rsvp/:eventId` - RSVP to event (auth required)
- `DELETE /api/rsvp/:eventId` - Cancel RSVP (auth required)
- `GET /api/rsvp/:eventId/attendees` - Get event attendees

## Geospatial Features

LocalVibe uses MongoDB's geospatial capabilities for location-based queries:

- **2dsphere Index**: Enables efficient geospatial queries on event locations
- **Radius Search**: Find events within a specified distance
- **Bounds Search**: Get events within map viewport boundaries
- **Address Geocoding**: Convert addresses to coordinates using OpenStreetMap Nominatim

## Deployment

### Frontend
The frontend is built using Vite and can be deployed to any static hosting service:

```bash
npm run build
```

The `dist` folder contains the production build.

### Backend
The backend can be deployed to services like Heroku, Railway, or Render:

```bash
cd server
npm start
```

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure random string for JWT signing
- `NODE_ENV` - Set to `production`
- `CORS_ORIGIN` - Your frontend URL (for CORS)

## API Key Management

### Map API Keys

This application uses OpenStreetMap tiles which are free and don't require an API key. If you want to use Mapbox or Google Maps:

1. Sign up for an API key at the respective provider
2. Add the key to your environment variables
3. Update the tile layer URL in `EventMap.tsx`

**Important**: Always restrict your API keys to your domain to prevent unauthorized usage.

## Project Structure

```
localvibe/
├── src/
│   ├── components/
│   │   ├── events/         # Event-related components
│   │   ├── layout/         # Layout components (Navbar, etc.)
│   │   └── map/            # Map components
│   ├── context/            # React contexts (Auth, Location)
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── types/              # TypeScript types
│   └── App.tsx             # Main App component
├── server/
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   ├── seed.js             # Database seed script
│   └── server.js           # Express server
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- [OpenStreetMap](https://www.openstreetmap.org/) for map tiles and geocoding
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Leaflet](https://leafletjs.com/) for interactive maps

---

Built with ❤️ for local communities everywhere.
