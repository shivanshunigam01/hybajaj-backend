# HY Bajaj Drive — Backend API

Independent Node.js + Express + MongoDB API for the HY Bajaj frontend (CRM + DSE Productivity MIS).

**Do not put frontend code here.** Frontend lives in the parent `hy-bajaj-drive` app.

## Stack

- Express.js
- MongoDB + Mongoose
- JWT (access + refresh)
- bcryptjs, express-validator, helmet, cors, rate-limit, hpp, mongo-sanitize
- Multer + Sharp + Cloudinary
- Nodemailer + AiSensy WhatsApp
- Swagger UI at `/api/docs`

## Quick start

```bash
cd backend
cp .env.example .env
# Edit MONGO_URI, JWT secrets
npm install
npm run seed
npm run dev
```

- API: http://localhost:5000  
- Health: http://localhost:5000/api/health  
- Swagger: http://localhost:5000/api/docs  

Default seeded admin (from `.env`):

- Email: `admin@hybajaj.com`
- Password: `SecurePass1`

## Main route groups

| Prefix | Description |
|--------|-------------|
| `/api/auth/*` | Login, register, OTP, password |
| `/api/public/*` | Contact, test rides, products, exchange, finance apply |
| `/api/leads/*` | Website CRM leads |
| `/api/dse/*` | Dashboard, daily tracker, funnel, finance cases, ROI, weekly, MBR |
| `/api/setup/*` | Masters |
| `/api/products`, `/api/users`, `/api/settings`, `/api/media/*`, `/api/reports/*` | Admin modules |

## Architecture

Route → Validation → Controller → Service → Model/MongoDB

## Spec source

Aligned with `../docs/API_DOCUMENTATION.md`.

## Scripts

| Command | Action |
|---------|--------|
| `npm run dev` | Nodemon |
| `npm start` | Production |
| `npm run seed` | Seed admin, branches, masters |
| `npm test` | Jest |
