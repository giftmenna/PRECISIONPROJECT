// Database Configuration
// Copy this to a .env file in your project root

module.exports = {
  DATABASE_URL: "postgresql://postgres.uuvbshfdxfpnnsbsuaiv:Pawrex000$@aws-1-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&sslmode=require",
  NEXTAUTH_URL: "http://localhost:3000",
  NEXTAUTH_SECRET: "your-secret-key-here-change-this-in-production",
  EMAIL_PROVIDER: "gmail",
  GMAIL_USER: "precisionacademicw@gmail.com",
  GMAIL_APP_PASSWORD: "fhtxhxnvurrafobz",
  PRISMA_CLIENT_ENGINE_TYPE: "dataproxy"
};

// To use:
// 1. Create a .env file in your project root
// 2. Copy the values above into your .env file
// 3. Never commit .env to version control
