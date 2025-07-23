const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password'] },
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const authorize = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userPermissions = req.user.role.permissions;
    const hasPermission = permissions.some(permission => userPermissions[permission] === true);

    if (!hasPermission && req.user.role.name !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role.name !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = { authenticateToken, authorize, requireAdmin };