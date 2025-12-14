# Copilot Instructions for Precision Academic World

## Project Overview
Precision Academic World is a comprehensive mathematics learning platform built with Next.js 15, featuring daily video lessons, practice sessions, competitions, and progress tracking. The platform uses a modern tech stack including React, TypeScript, Tailwind CSS, and Prisma ORM with PostgreSQL.

## Key Architecture Patterns

### Authentication & Authorization
- NextAuth.js handles authentication with session management
- User roles: `admin`, `user` (check `role` in session)
- Special admin account: `admin@precisionaw.com` has hardcoded access
- Auth checks in API routes follow pattern:
```typescript
const session = await getServerSession(authOptions);
if (!session?.user?.email) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### API Structure
- Route handlers in `src/app/api/` using Next.js App Router
- Consistent error handling pattern across routes
- Admin routes under `api/admin/` with role validation
- API route patterns: `[controller]/[id]/[action]` (e.g., `group-chat/[id]/messages`)

### Database Patterns
- Use `prisma` client instance imported from `@/lib/prisma`
- Transactions for multi-step operations
- Soft delete preferred over hard delete for data integrity
- Include relation counts where needed: `_count` in queries

### Component Patterns
- UI components from Shadcn (`@/components/ui/*`)
- Daily lessons follow builder pattern with questions management
- State management via React hooks with TypeScript types
- Modals use fixed positioning with z-index management

## Common Tasks

### Adding New Daily Lesson
1. Use the DailyLessonsPage component as reference
2. Required fields: title, description, videoUrl, duration, scheduledDate
3. Questions can be added before or after lesson creation
4. Auto-generate thumbnails from YouTube URLs

### Admin Features
- Dashboard stats under `/admin/dashboard-stats`
- Lesson management: Create, edit, activate/deactivate
- Question management per lesson
- Role-based access control in API routes

### Error Handling
- Use toast notifications from `@/hooks/use-toast`
- HTTP responses include descriptive messages
- Client-side validation before API calls
- Console logging for debugging with descriptive messages

## Environment Setup
Required variables in `.env.local`:
```
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
GMAIL_USER="your-gmail"
GMAIL_APP_PASSWORD="your-app-password"
EMAIL_PROVIDER="gmail"
OPENAI_API_KEY="optional-for-ai-features"
```

## Testing
- Test scripts in `/scripts` directory
- API auth testing: `test-api-auth.js`
- Database connection: `check-db-connection.js`
- Daily lessons flow: `test-daily-lessons-*.js`

## Common Pitfalls
1. Always check user role for admin routes
2. Handle hardcoded admin user case separately
3. Validate file uploads and URL inputs
4. Check for active status in daily lessons
5. Manage state updates after form submissions

## Development Workflow
1. Run database migrations first: `npx prisma db push`
2. Start dev server: `npm run dev`
3. Test API endpoints with provided scripts
4. Use semantic_search for code pattern discovery
5. Follow existing patterns for consistency