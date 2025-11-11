import { } from 'express';

// Admin middleware: ensures the authenticated user has role = 'admin'
// Usage: place after `protect` middleware so req.user is populated
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Access Denied' });
};

export default adminMiddleware;
