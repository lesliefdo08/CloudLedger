# CloudLedger

CloudLedger is a student database management system built with:

- Next.js (App Router)
- Prisma ORM
- PostgreSQL (AWS RDS compatible)
- AWS S3 with presigned upload/download URLs

## 1. Install

```bash
npm install
```

## 2. Configure Environment

Copy `.env.example` into `.env` and set values.

Required database value:

- `DATABASE_URL`

Required storage values (AWS mode):

- `STORAGE_PROVIDER=aws`
- `AWS_REGION`
- `AWS_S3_BUCKET`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Fallback mode:

- `STORAGE_PROVIDER=supabase` (uses local fallback routes in this project)

## 3. Apply Schema

```bash
npm run prisma:generate
npm run prisma:migrate
```

## 4. Seed Admin User

```bash
npm run prisma:seed
```

Default seed credentials:

- Email: `admin@cloudledger.com`
- Password: `admin123`

You can change with `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`.

## 5. Run Locally

```bash
npm run dev
```

Open `http://localhost:3001`.

## Features

- Admin login (session-based)
- Create and list students
- Student details page
- Upload student files (PDF/images)
- File versioning history
- Download latest or old versions
- S3 key stored in DB (`studentId/timestamp-filename`)
