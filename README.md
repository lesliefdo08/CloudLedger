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

Open `http://localhost:3000`.

## 6. Deploy to AWS Elastic Beanstalk (Node.js)

This app is configured for Elastic Beanstalk with:

- `Procfile` using `web: npm run start`
- `start` script on port `8080`
- `engines.node` set to `18.x`

### Step-by-step

1. In AWS, create an Elastic Beanstalk environment:
	 - Platform: `Node.js 18`
	 - Environment type: `Web server`
2. Zip this project (exclude `node_modules`) and upload as application version.
3. In Elastic Beanstalk -> Configuration -> Software, add environment variables:
	 - `DATABASE_URL`
	 - `STORAGE_PROVIDER=aws`
	 - `AWS_REGION`
	 - `AWS_S3_BUCKET`
	 - `AWS_ACCESS_KEY_ID`
	 - `AWS_SECRET_ACCESS_KEY`
	 - `ADMIN_EMAIL`
	 - `ADMIN_PASSWORD`
4. Deploy and wait for green health.
5. Open environment URL.

### Common deployment issues

- Procfile not detected:
	- Ensure file name is exactly `Procfile` (no extension)
- App not listening on expected port:
	- Keep `start` script as `next start -p 8080`
- Build failure on Beanstalk:
	- Confirm Node platform is 18 and `engines.node` is `18.x`
	- Run `npm run build` locally before uploading
- Prisma runtime issues:
	- `postinstall` runs `prisma generate`
	- Ensure `DATABASE_URL` exists in Beanstalk env vars

### Free-tier safety notes

- Use a single small environment only for demo
- Stop or terminate resources right after demo

## 7. Cleanup after demo (avoid charges)

1. Terminate Elastic Beanstalk environment.
2. Delete RDS database and skip final snapshot.
3. Empty and delete S3 bucket.
4. Delete IAM user and access keys used for this demo.
5. Check Billing -> Cost Explorer the next day to confirm no active resources.

## Features

- Admin login (session-based)
- Create and list students
- Student details page
- Upload student files (PDF/images)
- File versioning history
- Download latest or old versions
- S3 key stored in DB (`studentId/timestamp-filename`)
