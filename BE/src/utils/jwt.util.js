import jwt from "jsonwebtoken";

// Access Token Configuration
export const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET || "access-token-secret-change-in-production";
export const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES || "15m"; // Short lived

// Refresh Token Configuration
export const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || "refresh-token-secret-change-in-production";
export const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES || "7d"; // Long lived

// Cookie Configuration
export const COOKIE_OPTIONS = {
  httpOnly: true, // Prevents XSS attacks
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict", // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

// Generate Access Token
export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

// Generate Refresh Token
export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};

// Verify Access Token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};

// Verify Refresh Token
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};
