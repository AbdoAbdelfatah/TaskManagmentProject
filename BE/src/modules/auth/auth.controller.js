import User from "../../models/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  COOKIE_OPTIONS,
} from "../../utils/jwt.util.js";
import { asyncHandler } from "../../middlewares/asyncHandler.middleware.js";
import { ErrorClass } from "../../utils/errorClass.util.js";
import { successResponse } from "../../utils/response.util.js";

// @desc    Register a new user
// @route   POST /api/auth/register
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    throw new ErrorClass(
      "Name, email, and password are required",
      400,
      null,
      "register"
    );
  }

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ErrorClass("Email already registered", 400, null, "register");
  }

  // Create user
  const user = await User.create({ name, email, password });

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Save refresh token to database
  await user.update({ refreshToken });

  // Send refresh token in httpOnly cookie
  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

  return successResponse(res, 201, "User registered successfully", {
    user,
    token: accessToken,
  });
});

// @desc    Login user
// @route   POST /api/auth/login
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new ErrorClass(
      "Please provide email and password",
      400,
      null,
      "login"
    );
  }

  // Find user (include password for comparison)
  const user = await User.findOne({
    where: { email },
    attributes: { include: ["password"] },
  });

  if (!user) {
    throw new ErrorClass("Invalid credentials", 401, null, "login");
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ErrorClass("Invalid credentials", 401, null, "login");
  }

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Save refresh token to database
  await user.update({ refreshToken });

  // Send refresh token in httpOnly cookie
  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

  // Remove password from response
  const userResponse = user.toJSON();
  delete userResponse.password;

  return successResponse(res, 200, "Login successful", {
    user: userResponse,
    token: accessToken,
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
export const refreshAccessToken = asyncHandler(async (req, res, next) => {
  // Get refresh token from cookie
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new ErrorClass(
      "Refresh token not found",
      401,
      null,
      "refreshAccessToken"
    );
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    throw new ErrorClass(
      "Invalid refresh token",
      401,
      null,
      "refreshAccessToken"
    );
  }

  // Find user and check if refresh token matches
  const user = await User.findByPk(decoded.id);

  if (!user || user.refreshToken !== refreshToken) {
    throw new ErrorClass(
      "Invalid refresh token",
      401,
      null,
      "refreshAccessToken"
    );
  }

  // Generate new tokens (Token Rotation)
  const newAccessToken = generateAccessToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);

  // Update refresh token in database
  await user.update({ refreshToken: newRefreshToken });

  // Send new refresh token in cookie
  res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

  return successResponse(res, 200, "Token refreshed successfully", {
    accessToken: newAccessToken,
  });
});

// @desc    Logout user
// @route   POST /api/auth/logout
export const logout = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    // Remove refresh token from database
    const user = await User.findOne({ where: { refreshToken } });
    if (user) {
      await user.update({ refreshToken: null });
    }
  }

  // Clear refresh token cookie
  res.clearCookie("refreshToken", COOKIE_OPTIONS);

  return successResponse(res, 200, "Logged out successfully", null);
});

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req, res, next) => {
  return successResponse(res, 200, "User profile retrieved", {
    user: req.user,
  });
});
