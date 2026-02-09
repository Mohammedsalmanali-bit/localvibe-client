const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const seed = async () => {
  try {
    console.log('Seeding database...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const users = await pool.query(`
      INSERT INTO users (name, email, password, avatar, is_organizer, org_name, org_description)
      VALUES
        ('Sarah Johnson', 'sarah@example.com', $1, '', true, 'Community Events Co', 'Organizing the best local events'),
        ('Mike Chen', 'mike@example.com', $1, '', true, 'Mike''s Music', 'Live music events'),
        ('Lisa Park', 'lisa@example.com', $1, '', false, null, null),
        ('James Wilson', 'james@example.com', $1, '', true, 'Fresh Markets', 'Local farmers markets')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, name
    `, [hashedPassword]);

    if (users.rows.length === 0) {
      console.log('Users already seeded, checking events...');
      const existingUsers = await pool.query('SELECT id, name FROM users ORDER BY id LIMIT 4');
      if (existingUsers.rows.length > 0) {
        const userIds = existingUsers.rows;
        await seedEvents(userIds);
      }
      return;
    }

    await seedEvents(users.rows);
  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await pool.end();
  }
};

const seedEvents = async (users) => {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const in10Days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const in20Days = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);

  const events = [
    {
      title: 'Downtown Jazz Night',
      description: 'Enjoy a soulful evening of live jazz performances from top local musicians. Featuring the acclaimed Sarah Miles Quartet with special guest performers throughout the night. Drinks and small bites available for purchase.',
      category: 'Music',
      start_date: tomorrow,
      end_date: new Date(tomorrow.getTime() + 4 * 60 * 60 * 1000),
      address: '123 Main St, Downtown',
      lng: -73.9857,
      lat: 40.7484,
      price: 15,
      image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
      organizer_id: users[1]?.id || 1,
      organizer_name: users[1]?.name || 'Mike Chen',
      is_featured: true,
      max_attendees: 100,
      tags: ['jazz', 'live music', 'nightlife']
    },
    {
      title: 'Farmers Market Weekend',
      description: 'Fresh produce, artisan goods, and homemade treats from local farmers and producers. Over 40 vendors offering organic vegetables, fresh baked goods, handmade crafts, and more. Live acoustic music and free samples!',
      category: 'Markets',
      start_date: in3Days,
      end_date: new Date(in3Days.getTime() + 6 * 60 * 60 * 1000),
      address: '456 Park Ave, Central Park',
      lng: -73.9654,
      lat: 40.7829,
      price: 0,
      image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800',
      organizer_id: users[3]?.id || 4,
      organizer_name: users[3]?.name || 'James Wilson',
      is_featured: true,
      max_attendees: 500,
      tags: ['farmers market', 'organic', 'local food']
    },
    {
      title: 'Community Yoga in the Park',
      description: 'Start your morning with a rejuvenating yoga session in the beautiful park. All levels welcome - bring your own mat or use one of ours. Certified instructor leading a 90-minute flow session followed by guided meditation.',
      category: 'Wellness',
      start_date: in5Days,
      end_date: new Date(in5Days.getTime() + 2 * 60 * 60 * 1000),
      address: '789 Green St, Riverside Park',
      lng: -73.9712,
      lat: 40.8006,
      price: 0,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
      organizer_id: users[0]?.id || 1,
      organizer_name: users[0]?.name || 'Sarah Johnson',
      is_featured: true,
      max_attendees: 50,
      tags: ['yoga', 'wellness', 'outdoor', 'free']
    },
    {
      title: 'Street Art Walking Tour',
      description: 'Discover hidden murals and street art gems throughout the arts district. Our knowledgeable guide will share stories behind each piece and the artists who created them. Camera recommended!',
      category: 'Arts',
      start_date: nextWeek,
      end_date: new Date(nextWeek.getTime() + 3 * 60 * 60 * 1000),
      address: '321 Art Lane, Arts District',
      lng: -73.9442,
      lat: 40.7214,
      price: 10,
      image: 'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800',
      organizer_id: users[0]?.id || 1,
      organizer_name: users[0]?.name || 'Sarah Johnson',
      is_featured: false,
      max_attendees: 25,
      tags: ['art', 'walking tour', 'street art']
    },
    {
      title: 'Craft Beer Festival',
      description: 'Sample over 50 craft beers from local and regional breweries. Includes live music, food trucks, and brewery merchandise. VIP tickets include early access and exclusive tastings.',
      category: 'Food & Drink',
      start_date: in10Days,
      end_date: new Date(in10Days.getTime() + 8 * 60 * 60 * 1000),
      address: '555 Brew Ave, Warehouse District',
      lng: -73.9515,
      lat: 40.7282,
      price: 35,
      image: 'https://images.unsplash.com/photo-1436076863939-06870fe779c2?w=800',
      organizer_id: users[1]?.id || 2,
      organizer_name: users[1]?.name || 'Mike Chen',
      is_featured: true,
      max_attendees: 300,
      tags: ['craft beer', 'festival', 'food']
    },
    {
      title: 'Pickup Basketball Tournament',
      description: 'Friendly 3-on-3 basketball tournament open to all skill levels. Teams will be organized on-site. Prizes for the winning team. Refreshments provided.',
      category: 'Sports',
      start_date: in14Days,
      end_date: new Date(in14Days.getTime() + 5 * 60 * 60 * 1000),
      address: '888 Court St, Community Center',
      lng: -73.9872,
      lat: 40.7552,
      price: 5,
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
      organizer_id: users[2]?.id || 3,
      organizer_name: users[2]?.name || 'Lisa Park',
      is_featured: false,
      max_attendees: 40,
      tags: ['basketball', 'sports', 'tournament']
    },
    {
      title: 'Open Mic Comedy Night',
      description: 'Think you are funny? Prove it! Open mic night for aspiring comedians and seasoned performers. Sign up at the door for a 5-minute set. Audience members welcome too!',
      category: 'Other',
      start_date: in20Days,
      end_date: new Date(in20Days.getTime() + 3 * 60 * 60 * 1000),
      address: '222 Laugh Blvd, Theater District',
      lng: -73.9862,
      lat: 40.7591,
      price: 8,
      image: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800',
      organizer_id: users[0]?.id || 1,
      organizer_name: users[0]?.name || 'Sarah Johnson',
      is_featured: false,
      max_attendees: 80,
      tags: ['comedy', 'open mic', 'entertainment']
    },
    {
      title: 'Indie Rock Showcase',
      description: 'Three amazing local indie bands performing live. Featuring The Wavelengths, Echo Chamber, and Silver Thread. Full bar and food available.',
      category: 'Music',
      start_date: in5Days,
      end_date: new Date(in5Days.getTime() + 5 * 60 * 60 * 1000),
      address: '777 Rock Rd, Music Hall',
      lng: -73.9777,
      lat: 40.7425,
      price: 20,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
      organizer_id: users[1]?.id || 2,
      organizer_name: users[1]?.name || 'Mike Chen',
      is_featured: false,
      max_attendees: 200,
      tags: ['indie', 'rock', 'live music']
    }
  ];

  const existingEvents = await pool.query('SELECT COUNT(*) FROM events');
  if (parseInt(existingEvents.rows[0].count) > 0) {
    console.log('Events already seeded, skipping...');
    return;
  }

  for (const event of events) {
    await pool.query(
      `INSERT INTO events (title, description, category, start_date, end_date, location_address, location_lng, location_lat, price, image, organizer_id, organizer_name, is_featured, max_attendees, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [event.title, event.description, event.category, event.start_date, event.end_date, event.address, event.lng, event.lat,
       event.price, event.image, event.organizer_id, event.organizer_name, event.is_featured, event.max_attendees, event.tags]
    );
  }

  const eventIds = await pool.query('SELECT id FROM events ORDER BY id LIMIT 4');
  const userIds = await pool.query('SELECT id FROM users ORDER BY id LIMIT 4');

  if (eventIds.rows.length > 0 && userIds.rows.length > 1) {
    await pool.query('INSERT INTO rsvps (event_id, user_id, status) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [eventIds.rows[0].id, userIds.rows[2]?.id || 3, 'going']);
    await pool.query('INSERT INTO rsvps (event_id, user_id, status) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [eventIds.rows[0].id, userIds.rows[1]?.id || 2, 'interested']);
    await pool.query('INSERT INTO rsvps (event_id, user_id, status) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [eventIds.rows[1].id, userIds.rows[0]?.id || 1, 'going']);
    await pool.query('INSERT INTO rsvps (event_id, user_id, status) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
      [eventIds.rows[2].id, userIds.rows[2]?.id || 3, 'going']);
  }

  console.log('Database seeded successfully!');
};

seed();
