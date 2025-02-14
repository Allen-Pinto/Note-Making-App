import { errorHandler } from "./error.js";
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  // Check for token in cookies or Authorization header
  const token = req.cookies.access_token || req.headers['authorization']?.split(' ')[1];

  // If no token found, return 401 Unauthorized error
  if (!token) {
    return next(errorHandler(401, "No token provided"));
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // If token verification fails, return 403 Forbidden error
      return next(errorHandler(403, "Invalid token"));
    }

    // Attach user data to the request object
    req.user = user;
    next();
  });
};
