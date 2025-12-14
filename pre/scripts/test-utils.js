const { createHash, randomBytes } = require('crypto');

// This is a simplified version of NextAuth's cookie creation
// In a real app, you should use the same secret as your NextAuth config
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';

// Create a session token cookie similar to NextAuth
async function createCookie(name, value) {
  // Generate a random string for the session token
  const token = randomBytes(32).toString('hex');
  
  // Create a signature for the cookie
  const signature = createHash('sha256')
    .update(`${token}${NEXTAUTH_SECRET}`)
    .digest('hex');
  
  // Combine the token and signature
  return `${token}.${signature}`;
}

module.exports = {
  createCookie
};
