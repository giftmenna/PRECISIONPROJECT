# Precision Academic World

A comprehensive mathematics learning platform with practice sessions, competitions, and progress tracking.

## Features

- User authentication and authorization
- Practice sessions with various difficulty levels
- Competition system with leaderboards
- Progress tracking and analytics
- Admin panel for user management
- Real-time gem earning system
- Beautiful, responsive UI
- Avatar system with custom and hardcoded options

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Email**: Nodemailer with multiple providers

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations: `npx prisma db push`
5. Start the development server: `npm run dev`

## Environment Variables

Create a `.env.local` file with the following variables:

```env
DATABASE_URL="your-database-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GMAIL_USER="your-gmail"
GMAIL_APP_PASSWORD="your-app-password"
EMAIL_PROVIDER="gmail"
```

## Deployment

Deploy this project to your hosting provider of choice.

### Database Setup

For production, we recommend using a managed PostgreSQL database provider.

### Email Setup

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in `GMAIL_APP_PASSWORD`

## AI Assistant Setup

To enable high‑quality answers (math solving and app support), set your OpenAI API key.

1. Create a `.env` file in the project root:

```
OPENAI_API_KEY=your_openai_api_key_here
```

2. Restart the dev server or redeploy.

Notes:
- The assistant will automatically use OpenAI when the key is present, and fall back to built‑in guidance if not.
- Model used: `gpt-4o-mini` with concise, step‑by‑step math and app support instructions.
- For production, add `OPENAI_API_KEY` in Project Settings → Environment Variables.

## Project Structure

```
precisionaw/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   ├── admin/          # Admin dashboard
│   │   └── ...
│   ├── components/         # React components
│   ├── lib/               # Utility functions
│   └── types/             # TypeScript types
├── prisma/                # Database schema
├── public/                # Static assets
└── ...
```
