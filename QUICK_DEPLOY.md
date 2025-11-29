# Shopify Insights Service - Quick Deployment Guide

## 🚀 Deploy Now (5 Minutes)

### Step 1: Create PostgreSQL Database

**Option A: Vercel Postgres (Recommended)**
1. Go to https://vercel.com/dashboard
2. Click "Storage" → "Create Database" → "Postgres"
3. Name it: `shopify-insights-db`
4. Copy the connection string (starts with `postgresql://`)

**Option B: Neon (Free Serverless)**
1. Go to https://neon.tech
2. Sign up (free)
3. Create new project: `shopify-insights`
4. Copy connection string from dashboard

---

### Step 2: Push to GitHub

```bash
# Create new repository on GitHub: shopify-insights-service
# Then run:

cd "c:/Users/user/OneDrive/Documents/XENO FTE"
git remote add origin https://github.com/YOUR_USERNAME/shopify-insights-service.git
git branch -M main
git push -u origin main
```

---

### Step 3: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Remix
   - **Build Command**: `prisma generate && npm run build`
   - **Output Directory**: `build`

5. **Add Environment Variables**:
   ```
   DATABASE_URL=your_postgres_connection_string
   AUTH_SECRET=your_random_32_char_string
   JWT_SECRET=your_random_32_char_string
   APP_URL=https://your-app.vercel.app
   ```

6. Click "Deploy"

---

### Step 4: Initialize Database

After deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migration
DATABASE_URL="your_postgres_url" npx prisma db push
```

---

### Step 5: Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Go to `/setup` page
3. Enter Shopify credentials:
   - Shop Domain: `your-store.myshopify.com`
   - Access Token: `shpat_xxxxx`
4. Click "Start Ingestion"
5. View dashboard at `/dashboard/overview`

---

### Step 6: Register Webhooks (Optional - for real-time sync)

1. Go to Shopify Admin → Settings → Notifications → Webhooks
2. Click "Create webhook"
3. For each event:
   - **Event**: orders/create
   - **Format**: JSON
   - **URL**: `https://your-app.vercel.app/api/webhooks/shopify`
   - **API version**: 2024-01

4. Repeat for:
   - orders/updated
   - customers/create
   - customers/update
   - products/create
   - products/update

5. Copy webhook secret and add to Vercel:
   ```bash
   vercel env add SHOPIFY_WEBHOOK_SECRET
   ```

---

## 🎯 Quick Commands Reference

```bash
# Local development
npm install
npm run dev

# Database
npm run db:push      # Push schema
npm run db:studio    # Open Prisma Studio

# Deployment
git push origin main  # Auto-deploys to Vercel
vercel --prod        # Manual deploy

# Logs
vercel logs          # View production logs
```

---

## ✅ Deployment Checklist

- [ ] PostgreSQL database created
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] First deployment successful
- [ ] Database schema initialized
- [ ] Test tenant created
- [ ] Dashboard accessible
- [ ] Webhooks registered (optional)
- [ ] Test order synced (optional)

---

## 🆘 Troubleshooting

**Build fails:**
```bash
# Check Vercel logs
vercel logs

# Common fix: ensure all dependencies installed
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

**Database connection fails:**
```bash
# Verify DATABASE_URL format
postgresql://user:password@host:5432/database?sslmode=require

# Test locally
npx prisma db push
```

**Webhooks not working:**
- Verify SHOPIFY_WEBHOOK_SECRET matches Shopify
- Check Vercel function logs
- Test HMAC signature locally

---

## 📊 Cost Breakdown

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Vercel | 100GB bandwidth | $20/mo (Pro) |
| Vercel Postgres | 256MB storage | $20/mo (Pro) |
| Neon | 0.5GB storage | $19/mo (Scale) |
| **Total** | **$0** | **$40/mo** |

Free tier is sufficient for development and small production use!

---

## 🎉 You're Done!

Your Shopify Insights Service is now live at:
`https://your-app.vercel.app`

Next: Share with stakeholders, gather feedback, iterate! 🚀
