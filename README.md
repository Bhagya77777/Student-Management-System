# Student Management System

## Backend Setup (PostgreSQL + Prisma)

1. Copy `.env.example` to `.env` and update values.

```bash
cp .env.example .env
```

2. Ensure PostgreSQL is running and `DATABASE_URL` points to your database.
3. Run:

```bash
pnpm install
pnpm db:generate
```

4. Start app:

```bash
pnpm dev
```

## Implemented Modules

- Authentication API with cookie session and role-aware login/register
- PostgreSQL schema for student, parent, lecturer, admin, leave, attendance, marks
- Admin user CRUD page wired to `/api/users`
- Student leave request CRUD with strict validation
- Parent leave approval workflow
- Lecturer student listing and prediction endpoint
- AI chatbot endpoint with OpenRouter free-model integration and local fallback

## Validation Rules

- Student leave requests are allowed only for tomorrow.
- Past dates and dates beyond tomorrow are blocked.
- Overlapping pending/approved leave ranges are blocked.
- Parent can only approve/reject child leave requests.

This is a [Next.js](https://nextjs.org) project.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/DulithaBandaranayake/student-management-system.git
cd student-management-system
```

### 2. Install dependencies

Using pnpm (recommended):

```bash
pnpm install
```

Or with npm:

```bash
npm install
```

Or with yarn:

```bash
yarn install
```

### 3. Run the development server

```bash
pnpm run dev
# or
npm run dev
# or
yarn dev
```

pnpm run start

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

### 4. Build and run in production

First, build the application:

```bash
pnpm run build
# or
npm run build
# or
yarn build
```

Then start the production server:

```bash
pnpm start
# or
npm start
# or
yarn start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

### 5. AI Model Register
- https://openrouter.ai/
