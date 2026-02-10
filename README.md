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
- **PostgreSQL** with `pg`
- **JWT** authentication
- **Express Validator** for input validation

## Getting Started

### Prerequisites
- Node.js 18+
- Docker Desktop (recommended for dev)

### Installation (Docker Compose)

1. Build and start services:
```bash
npm run compose:up
```

2. Seed the database:
```bash
npm run compose:seed
```

3. Open the app at `http://localhost:5000`

Or do both with one command:
```bash
npm run dev:compose
```

### Notes
- **Docker-only setup**: You can run everything with Docker even if Node.js is not installed locally.
- **Node.js setup**: On another machine with Node.js installed, you can run the app with the manual/local dev steps below (you still need Postgres and `DATABASE_URL`).

### Installation (Manual / Local Dev)

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
SERVER_PORT=3001
HOST=127.0.0.1
DATABASE_URL=postgres://postgres:localvibe@localhost:5432/localvibe
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

5. Seed the database with sample data:
```bash
cd server
node seed.cjs
```

6. Start the development servers:

Backend:
```bash
cd server
node server.cjs
```

Frontend (in a new terminal):
```bash
npm run dev
```

7. Open your browser and navigate to `http://localhost:5000`

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

LocalVibe uses stored coordinates for location-based queries:

- **Radius Search**: Find events within a specified distance (planned)
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
node server.cjs
```

### Environment Variables for Production

Make sure to set these environment variables in your production environment:

- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure random string for JWT signing
- `NODE_ENV` - Set to `production`
- `CORS_ORIGIN` - Your frontend URL (for CORS)
 - `DATABASE_URL` - PostgreSQL connection string

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
│   ├── middleware/         # Express middleware
│   ├── middleware/         # Express middleware
│   ├── seed.cjs            # Database seed script
│   └── server.cjs          # Express server
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
