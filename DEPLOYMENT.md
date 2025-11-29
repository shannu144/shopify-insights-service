# Shopify Insights Service - Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- PostgreSQL database (Vercel Postgres or Neon recommended)
- Shopify development store

### Step 1: Prepare Database

**Option A: Vercel Postgres (Recommended)**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create new project → Storage → Postgres
3. Copy the `DATABASE_URL` connection string

**Option B: Neon (Serverless PostgreSQL)**
1. Go to [Neon](https://neon.tech)
2. Create free account and database
3. Copy the connection string

### Step 2: Push to GitHub

```bash
cd "c:/Users/user/OneDrive/Documents/XENO FTE"
git init
git add .
git commit -m "Initial commit - Shopify Insights Service"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables:

```env
DATABASE_URL=your_postgres_connection_string
AUTH_SECRET=generate_random_32_char_string
JWT_SECRET=generate_another_random_32_char_string
APP_URL=https://your-app.vercel.app
SHOPIFY_WEBHOOK_SECRET=will_add_after_deployment
```

5. Click "Deploy"

### Step 4: Initialize Database

After deployment, run migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Run database migration
vercel env pull .env.local
npm run db:push
```

### Step 5: Register Shopify Webhooks

1. Go to your Shopify Admin → Settings → Notifications → Webhooks
2. Create webhooks for:
   - `orders/create` → `https://your-app.vercel.app/api/webhooks/shopify`
   - `orders/updated` → `https://your-app.vercel.app/api/webhooks/shopify`
   - `customers/create` → `https://your-app.vercel.app/api/webhooks/shopify`
   - `customers/update` → `https://your-app.vercel.app/api/webhooks/shopify`
   - `products/create` → `https://your-app.vercel.app/api/webhooks/shopify`
   - `products/update` → `https://your-app.vercel.app/api/webhooks/shopify`

3. Copy the webhook secret and add to Vercel:
```bash
vercel env add SHOPIFY_WEBHOOK_SECRET
```

---

## 🏗️ Local Development

### Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your values
# DATABASE_URL=postgresql://...
# AUTH_SECRET=your-secret
# JWT_SECRET=your-jwt-secret

# Initialize database
npm run db:push

# Start development server
npm run dev
```

Visit `http://localhost:5173`

---

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `AUTH_SECRET` | Secret for authentication | ✅ Yes |
| `JWT_SECRET` | Secret for JWT tokens | ✅ Yes |
| `APP_URL` | Your application URL | ✅ Yes |
| `SHOPIFY_WEBHOOK_SECRET` | Shopify webhook verification secret | ⚠️ Production only |

---

## 🔐 Authentication

The service uses JWT-based authentication with bcrypt password hashing.

### Register New User

```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

### Login

```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

Returns JWT token for authenticated requests.

---

## 🔄 Webhook Integration

Webhooks automatically sync data from Shopify in real-time:

- **Orders**: Synced on create/update
- **Customers**: Synced on create/update
- **Products**: Synced on create/update

All webhooks are verified using HMAC signatures for security.

---

## 🗄️ Database Schema

```
Tenant (Multi-tenant support)
├── Products
├── Customers
└── Orders

User (Authentication)
└── Linked to Tenant (optional)
```

---

## 🧪 Testing

### Test Webhook Locally

Use [ngrok](https://ngrok.com) to expose local server:

```bash
# Start local server
npm run dev

# In another terminal
ngrok http 5173

# Use ngrok URL for Shopify webhooks
# https://abc123.ngrok.io/api/webhooks/shopify
```

### Test Authentication

```bash
# Register
curl -X POST http://localhost:5173/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 📊 Database Management

```bash
# Push schema changes
npm run db:push

# Open Prisma Studio (GUI)
npm run db:studio

# Generate Prisma Client
npx prisma generate
```

---

## 🚨 Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db push

# If fails, check DATABASE_URL format:
# postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

### Webhook Not Receiving Events

1. Check webhook URL is correct
2. Verify SHOPIFY_WEBHOOK_SECRET matches Shopify
3. Check Vercel logs: `vercel logs`
4. Test HMAC verification locally

### Build Failures

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npx prisma generate
```

---

## 📈 Production Checklist

- [ ] PostgreSQL database created
- [ ] Environment variables configured in Vercel
- [ ] Database schema pushed (`npm run db:push`)
- [ ] Application deployed to Vercel
- [ ] Shopify webhooks registered
- [ ] Webhook secret added to environment
- [ ] Test order created in Shopify
- [ ] Data appears in dashboard
- [ ] Authentication tested
- [ ] Multi-tenant isolation verified

---

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Shopify Webhook Documentation](https://shopify.dev/docs/api/admin-rest/2024-01/resources/webhook)
- [Remix Documentation](https://remix.run/docs)

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Vercel deployment logs
3. Check Prisma schema matches database
4. Verify environment variables are set correctly
