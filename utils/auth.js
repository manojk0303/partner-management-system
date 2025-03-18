// utils/auth.js
import { jwtVerify, SignJWT } from 'jose';

// This would be an environment variable in production
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');

// Sign a new JWT token
export async function signToken(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Token expires in 24 hours
    .sign(JWT_SECRET);
  
  return token;
}

// Verify a JWT token
export async function verifyAuth(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

// Extract user from JWT token
export async function getUserFromToken(token) {
  try {
    const payload = await verifyAuth(token);
    return payload;
  } catch (error) {
    return null;
  }
}

// Set token in cookies
export function setAuthCookie(res, token) {
  res.cookies.set({
    name: 'admin_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 1 day in seconds
    path: '/',
  });
}

// Remove auth cookie
export function removeAuthCookie(res) {
  res.cookies.set({
    name: 'admin_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
}