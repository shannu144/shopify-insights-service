# Shopify Insights Service

Multi-tenant Shopify data ingestion and insights dashboard with real-time webhook synchronization.

## Features

- ✅ **Multi-tenant Architecture**: Isolated data per Shopify store
- ✅ **Real-time Sync**: Shopify webhooks for instant data updates
- ✅ **Secure Authentication**: JWT-based auth with bcrypt password hashing
- ✅ **Insights Dashboard**: Revenue, orders, and customer analytics
- ✅ **Production Ready**: Deployed on Vercel with PostgreSQL

## Tech Stack

- **Framework**: Remix (React + Node.js)
- **Database**: PostgreSQL (via Prisma ORM)
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Auth**: JWT + bcrypt
- **Deployment**: Vercel

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database URL and secrets

# Initialize database
npm run db:push

# Start dev server
npm run dev
```

Visit `http://localhost:5173`

### Deploy to Production

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure

```
app/
├── routes/
│   ├── _index.tsx              # Login page
│   ├── dashboard.tsx           # Dashboard layout
│   ├── dashboard.overview.tsx  # Analytics overview
│   ├── dashboard.orders.tsx    # Orders list
│   ├── setup.tsx               # Tenant onboarding
│   ├── api.ingest.ts           # Manual data sync
│   └── api.webhooks.shopify.ts # Webhook handler
├── services/
│   ├── auth.server.ts          # Authentication logic
│   └── shopify.server.ts       # Shopify API client
prisma/
└── schema.prisma               # Database schema
```

## Environment Variables

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret
APP_URL=https://your-app.vercel.app
SHOPIFY_WEBHOOK_SECRET=your-webhook-secret
```

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/ingest` - Trigger manual data sync
- `POST /api/webhooks/shopify` - Shopify webhook receiver

## Database Schema

- **Tenant**: Shopify store configuration
- **Product**: Product catalog
- **Customer**: Customer data
- **Order**: Order history
- **User**: Authentication

## Security Features

- HMAC signature verification for webhooks
- Password hashing with bcrypt
- JWT token-based authentication
- SQL injection prevention (Prisma)
- HTTPS only in production

## License

MIT
