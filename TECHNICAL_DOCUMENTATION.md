# Shopify Data Ingestion & Insights Service
## Technical Documentation

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Assumptions](#assumptions)
3. [High-Level Architecture](#high-level-architecture)
4. [Data Models](#data-models)
5. [API Endpoints](#api-endpoints)
6. [Production Deployment](#production-deployment)
7. [Next Steps](#next-steps)

---

## Executive Summary

This document describes the Shopify Data Ingestion & Insights Service, a multi-tenant SaaS application that ingests data from Shopify stores and provides real-time analytics through an interactive dashboard.

**Key Features:**
- Multi-tenant architecture with data isolation
- Real-time data synchronization via Shopify webhooks
- Secure JWT-based authentication
- Interactive analytics dashboard
- Production-ready deployment on Vercel

**Tech Stack:**
- **Frontend/Backend**: Remix (React + Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Authentication**: JWT + bcrypt
- **Deployment**: Vercel (serverless)

---

## 1. Assumptions

### 1.1 Business Assumptions
- **Target Users**: Shopify store owners who want centralized analytics
- **Data Scope**: Focus on Orders, Customers, and Products (core entities)
- **Update Frequency**: Real-time via webhooks (not batch processing)
- **Multi-tenancy**: Each Shopify store is a separate tenant with isolated data

### 1.2 Technical Assumptions
- **Database**: PostgreSQL is available (Vercel Postgres or Neon)
- **Shopify Access**: Users have Admin API access tokens for their stores
- **API Version**: Shopify Admin API 2024-01
- **Authentication**: Simple email/password (can be upgraded to OAuth)
- **Deployment**: Serverless environment (Vercel) with cold starts acceptable

### 1.3 Data Assumptions
- **Historical Data**: Initial sync pulls recent data (configurable limit)
- **Data Retention**: No automatic deletion (implement if needed)
- **Currency**: All monetary values stored as-is from Shopify
- **Timezone**: UTC for all timestamps

### 1.4 Security Assumptions
- **HTTPS**: All production traffic over HTTPS
- **Webhook Verification**: HMAC signatures verified for all webhooks
- **Password Storage**: Bcrypt hashing with salt rounds = 10
- **Token Expiry**: JWT tokens expire after 7 days

---

## 2. High-Level Architecture

### 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Login Page   │  │  Dashboard   │  │ Setup Page   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      REMIX APPLICATION                           │
│                      (Vercel Serverless)                         │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    ROUTE HANDLERS                        │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │   │
│  │  │ Auth API │  │ Ingest   │  │ Webhooks │             │   │
│  │  │          │  │ API      │  │ Handler  │             │   │
│  │  └──────────┘  └──────────┘  └──────────┘             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  SERVICE LAYER                           │   │
│  │  ┌──────────────┐  ┌──────────────┐                    │   │
│  │  │ Auth Service │  │ Shopify API  │                    │   │
│  │  │ (JWT/bcrypt) │  │ Client       │                    │   │
│  │  └──────────────┘  └──────────────┘                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   PRISMA ORM                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SQL
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL DATABASE                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Tenants  │  │ Products │  │ Customers│  │  Orders  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│  ┌──────────┐                                                   │
│  │  Users   │                                                   │
│  └──────────┘                                                   │
└─────────────────────────────────────────────────────────────────┘

                              ▲
                              │ Webhooks (HTTPS)
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      SHOPIFY STORES                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Store A     │  │  Store B     │  │  Store C     │          │
│  │  (Tenant 1)  │  │  (Tenant 2)  │  │  (Tenant 3)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

#### 2.2.1 Initial Data Sync
```
User → Setup Page → Submit Credentials → Ingest API
                                            │
                                            ▼
                                    Shopify API Client
                                            │
                                            ├─→ Fetch Products
                                            ├─→ Fetch Customers
                                            └─→ Fetch Orders
                                            │
                                            ▼
                                    Prisma ORM (Upsert)
                                            │
                                            ▼
                                    PostgreSQL Database
```

#### 2.2.2 Real-time Webhook Sync
```
Shopify Store → Order Created → Webhook Event
                                      │
                                      ▼
                              Webhook Handler
                                      │
                                      ├─→ Verify HMAC Signature
                                      ├─→ Parse Payload
                                      └─→ Process Event
                                      │
                                      ▼
                              Prisma ORM (Upsert)
                                      │
                                      ▼
                              PostgreSQL Database
                                      │
                                      ▼
                              Dashboard (Real-time Update)
```

### 2.3 Multi-Tenancy Architecture

**Approach**: Shared Database with Tenant Isolation

```
┌─────────────────────────────────────────┐
│         PostgreSQL Database              │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ All tables have tenantId column    │ │
│  └────────────────────────────────────┘ │
│                                          │
│  Tenant A Data  │  Tenant B Data        │
│  ──────────────────────────────────     │
│  Products (A)   │  Products (B)         │
│  Customers (A)  │  Customers (B)        │
│  Orders (A)     │  Orders (B)           │
└─────────────────────────────────────────┘

Query Filtering:
WHERE tenantId = 'tenant-a-uuid'
```

**Benefits:**
- Simple to implement and maintain
- Cost-effective (single database)
- Easy to backup and restore
- Good for small to medium scale

**Trade-offs:**
- Requires careful query filtering
- Shared resource pool
- Less isolation than separate databases

---

## 3. Data Models

### 3.1 Entity Relationship Diagram

```
┌─────────────────┐
│     Tenant      │
│─────────────────│
│ id (PK)         │
│ name            │
│ shopDomain      │◄────────┐
│ accessToken     │         │
│ createdAt       │         │
│ updatedAt       │         │
└─────────────────┘         │
         │                  │
         │ 1:N              │
         ▼                  │
┌─────────────────┐         │
│    Product      │         │
│─────────────────│         │
│ id (PK)         │         │
│ shopifyId       │         │
│ title           │         │
│ price           │         │
│ tenantId (FK)   │─────────┘
│ createdAt       │
│ updatedAt       │
└─────────────────┘

         │
         │ 1:N
         ▼
┌─────────────────┐
│    Customer     │
│─────────────────│
│ id (PK)         │
│ shopifyId       │
│ firstName       │
│ lastName        │
│ email           │
│ totalSpent      │
│ tenantId (FK)   │─────────┐
│ createdAt       │         │
│ updatedAt       │         │
└─────────────────┘         │
         │                  │
         │ 1:N              │
         ▼                  │
┌─────────────────┐         │
│     Order       │         │
│─────────────────│         │
│ id (PK)         │         │
│ shopifyId       │         │
│ orderNumber     │         │
│ totalPrice      │         │
│ currency        │         │
│ processedAt     │         │
│ tenantId (FK)   │─────────┘
│ customerId (FK) │
│ createdAt       │
│ updatedAt       │
└─────────────────┘

┌─────────────────┐
│      User       │
│─────────────────│
│ id (PK)         │
│ email (UNIQUE)  │
│ password (hash) │
│ tenantId (FK)   │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
```

### 3.2 Prisma Schema

```prisma
model Tenant {
  id          String   @id @default(uuid())
  name        String
  shopDomain  String   @unique
  accessToken String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  products  Product[]
  customers Customer[]
  orders    Order[]
}

model Product {
  id        String   @id @default(uuid())
  shopifyId String
  title     String
  price     Float
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([shopifyId, tenantId])
}

model Customer {
  id         String   @id @default(uuid())
  shopifyId  String
  firstName  String?
  lastName   String?
  email      String?
  totalSpent Float    @default(0)
  tenantId   String
  tenant     Tenant   @relation(fields: [tenantId], references: [id])
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  orders     Order[]

  @@unique([shopifyId, tenantId])
}

model Order {
  id          String    @id @default(uuid())
  shopifyId   String
  orderNumber Int
  totalPrice  Float
  currency    String
  processedAt DateTime
  tenantId    String
  tenant      Tenant    @relation(fields: [tenantId], references: [id])
  customerId  String?
  customer    Customer? @relation(fields: [customerId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([shopifyId, tenantId])
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  tenantId  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 3.3 Key Design Decisions

1. **Composite Unique Constraints**: `@@unique([shopifyId, tenantId])` ensures no duplicate Shopify entities per tenant
2. **UUID Primary Keys**: Better for distributed systems and security
3. **Soft Relationships**: Customer-Order relationship is optional (some orders may not have customer data)
4. **Timestamps**: All entities track creation and update times
5. **Password Hashing**: User passwords stored as bcrypt hashes, never plaintext

---

## 4. API Endpoints

### 4.1 Authentication APIs

#### POST `/api/auth/register`
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "tenantId": "optional-tenant-uuid"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "tenantId": "uuid"
  },
  "token": "jwt-token-here"
}
```

**Response (400):**
```json
{
  "error": "User already exists"
}
```

---

#### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "tenantId": "uuid"
  },
  "token": "jwt-token-here"
}
```

**Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### 4.2 Data Ingestion APIs

#### POST `/api/ingest`
Trigger manual data synchronization from Shopify.

**Request:**
```json
{
  "shopDomain": "mystore.myshopify.com",
  "accessToken": "shpat_xxxxx",
  "tenantName": "My Store"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Data ingestion started",
  "tenant": {
    "id": "uuid",
    "name": "My Store",
    "shopDomain": "mystore.myshopify.com"
  },
  "stats": {
    "products": 150,
    "customers": 1250,
    "orders": 3400
  }
}
```

**Response (400):**
```json
{
  "error": "Invalid Shopify credentials"
}
```

---

### 4.3 Webhook APIs

#### POST `/api/webhooks/shopify`
Receive and process Shopify webhook events.

**Headers:**
```
X-Shopify-Topic: orders/create
X-Shopify-Hmac-Sha256: base64-encoded-hmac
X-Shopify-Shop-Domain: mystore.myshopify.com
```

**Request Body:**
```json
{
  "id": 123456789,
  "order_number": 1001,
  "total_price": "150.00",
  "currency": "USD",
  "processed_at": "2024-01-15T10:30:00Z",
  "customer": {
    "id": 987654321,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com"
  }
}
```

**Response (200):**
```json
{
  "success": true
}
```

**Response (401):**
```json
{
  "error": "Invalid signature"
}
```

**Supported Topics:**
- `orders/create`
- `orders/updated`
- `customers/create`
- `customers/update`
- `products/create`
- `products/update`

---

### 4.4 Dashboard APIs (Loaders)

#### GET `/dashboard/overview`
Fetch overview metrics and chart data.

**Response:**
```json
{
  "metrics": {
    "totalRevenue": 154300.50,
    "totalOrders": 3400,
    "totalCustomers": 1250
  },
  "ordersTrend": [
    { "date": "2024-01-01", "count": 45 },
    { "date": "2024-01-02", "count": 52 }
  ],
  "topCustomers": [
    {
      "id": "uuid",
      "name": "Alice Smith",
      "email": "alice@example.com",
      "totalSpent": 5400.00
    }
  ]
}
```

---

## 5. Production Deployment

### 5.1 Deployment Architecture

```
GitHub Repository
       │
       │ Push
       ▼
Vercel (Auto Deploy)
       │
       ├─→ Build: prisma generate && remix build
       ├─→ Deploy: Serverless Functions
       └─→ Environment Variables
       │
       ▼
Production URL
https://shopify-insights.vercel.app
       │
       ├─→ PostgreSQL (Vercel Postgres)
       └─→ Shopify Webhooks
```

### 5.2 Environment Configuration

**Required Variables:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
AUTH_SECRET=32-char-random-string
JWT_SECRET=32-char-random-string
APP_URL=https://your-app.vercel.app
SHOPIFY_WEBHOOK_SECRET=from-shopify-admin
```

### 5.3 Deployment Steps

1. **Setup Database**
   ```bash
   # Create Vercel Postgres database
   vercel postgres create
   
   # Get connection string
   vercel env pull
   ```

2. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

4. **Initialize Database**
   ```bash
   npm run db:push
   ```

5. **Register Webhooks**
   - Go to Shopify Admin → Settings → Notifications → Webhooks
   - Add webhook URL: `https://your-app.vercel.app/api/webhooks/shopify`
   - Subscribe to: orders/create, customers/create, products/create

### 5.4 Monitoring & Logging

**Vercel Dashboard:**
- Real-time logs
- Function invocation metrics
- Error tracking

**Recommended Tools:**
- **Sentry**: Error monitoring
- **LogRocket**: Session replay
- **Datadog**: APM and infrastructure monitoring

---

## 6. Next Steps to Productionize

### 6.1 Security Enhancements

- [ ] **OAuth Flow**: Replace access tokens with OAuth for better security
- [ ] **Rate Limiting**: Implement API rate limiting (express-rate-limit)
- [ ] **CORS Configuration**: Restrict allowed origins
- [ ] **Input Validation**: Add Zod schema validation
- [ ] **SQL Injection Prevention**: Already handled by Prisma
- [ ] **XSS Protection**: Sanitize user inputs
- [ ] **CSRF Tokens**: Add for form submissions

### 6.2 Performance Optimizations

- [ ] **Database Indexing**: Add indexes on frequently queried columns
  ```sql
  CREATE INDEX idx_orders_tenant_date ON orders(tenantId, processedAt);
  CREATE INDEX idx_customers_tenant_email ON customers(tenantId, email);
  ```
- [ ] **Query Optimization**: Use Prisma's `select` to fetch only needed fields
- [ ] **Caching**: Implement Redis for dashboard metrics
- [ ] **Pagination**: Add cursor-based pagination for large datasets
- [ ] **Connection Pooling**: Configure Prisma connection pool
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
    pool_size = 10
  }
  ```

### 6.3 Feature Enhancements

- [ ] **Advanced Analytics**
  - Revenue forecasting
  - Customer lifetime value (CLV)
  - Cohort analysis
  - Churn prediction

- [ ] **Export Functionality**
  - CSV export for reports
  - PDF generation
  - Scheduled email reports

- [ ] **Notifications**
  - Email alerts for low inventory
  - Slack integration
  - Push notifications

- [ ] **Multi-User Support**
  - Role-based access control (RBAC)
  - Team collaboration features
  - Audit logs

### 6.4 Scalability Improvements

- [ ] **Database Sharding**: Partition data by tenant for large scale
- [ ] **Read Replicas**: Add read replicas for analytics queries
- [ ] **Queue System**: Use BullMQ for async webhook processing
- [ ] **CDN**: Use Vercel Edge for static assets
- [ ] **Microservices**: Split ingestion and analytics into separate services

### 6.5 Reliability & Monitoring

- [ ] **Health Checks**: Add `/health` endpoint
- [ ] **Uptime Monitoring**: Use UptimeRobot or Pingdom
- [ ] **Backup Strategy**: Automated daily database backups
- [ ] **Disaster Recovery**: Document recovery procedures
- [ ] **Load Testing**: Use k6 or Artillery for stress testing

### 6.6 Compliance & Governance

- [ ] **GDPR Compliance**: Add data deletion endpoints
- [ ] **Data Retention Policy**: Implement automatic data cleanup
- [ ] **Privacy Policy**: Document data handling practices
- [ ] **Terms of Service**: Legal agreements
- [ ] **SOC 2 Compliance**: For enterprise customers

---

## 7. Conclusion

This Shopify Insights Service provides a solid foundation for multi-tenant data ingestion and analytics. The architecture is designed for scalability, security, and ease of deployment.

**Key Achievements:**
✅ Multi-tenant data isolation
✅ Real-time webhook synchronization
✅ Secure authentication (JWT + bcrypt)
✅ Production-ready deployment (Vercel)
✅ Comprehensive documentation

**Production Readiness**: 70%
- Core functionality: ✅ Complete
- Security: ⚠️ Good (needs OAuth)
- Performance: ⚠️ Good (needs caching)
- Monitoring: ❌ Needs implementation
- Compliance: ❌ Needs implementation

**Estimated Time to Full Production**: 2-3 weeks
- Week 1: Security & performance optimizations
- Week 2: Monitoring & testing
- Week 3: Compliance & documentation

---

## Appendix

### A. Technology Choices Rationale

| Technology | Why Chosen | Alternatives Considered |
|------------|------------|------------------------|
| Remix | Full-stack framework, great DX | Next.js, SvelteKit |
| PostgreSQL | ACID compliance, mature | MongoDB, MySQL |
| Prisma | Type-safe ORM, migrations | TypeORM, Sequelize |
| Vercel | Easy deployment, free tier | Railway, Render, Heroku |
| JWT | Stateless auth, scalable | Session cookies |
| TailwindCSS | Rapid UI development | Material-UI, Chakra UI |

### B. Cost Estimation (Monthly)

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Hobby | $0 |
| Vercel Postgres | Hobby | $0 |
| Total | | **$0** |

**Note**: Free tier sufficient for development and small-scale production. For scale:
- Vercel Pro: $20/month
- Vercel Postgres Pro: $20/month
- Total: ~$40/month for production

### C. References

- [Shopify API Documentation](https://shopify.dev/docs/api)
- [Remix Documentation](https://remix.run/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
