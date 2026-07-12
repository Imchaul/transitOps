const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const logger = require('../utils/logger');
const { validateEmail, validatePassword } = require('../validators/auth.validator');

class AuthController {
  async register(req, res, next) {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      // Validate
      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      if (!validatePassword(password)) {
        return res.status(400).json({
          error: 'Password must be at least 8 characters with uppercase, lowercase, and number'
        });
      }

      // Check existing user
      const existingUser = await User.findOne({
        where: { 
          [require('sequelize').Op.or]: [{ email }, { username }]
        }
      });

      if (existingUser) {
        return res.status(409).json({
          error: 'User with this email or username already exists'
        });
      }

      // Create user
      const user = await User.create({
        username,
        email,
        password,
        firstName,
        lastName
      });

      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      await user.update({ refreshToken });

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        },
        token,
        refreshToken
      });
    } catch (error) {
      logger.error('Registration error:', error);
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({
        where: { email },
        include: [{ model: Role }]
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      await user.update({ 
        refreshToken,
        lastLogin: new Date()
      });

      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.Role?.name || 'user'
        },
        token,
        refreshToken
      });
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token required' });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.findOne({
        where: { 
          id: decoded.id,
          refreshToken 
        }
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      const newToken = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      await user.update({ refreshToken: newRefreshToken });

      res.json({
        token: newToken,
        refreshToken: newRefreshToken
      });
    } catch (error) {
      logger.error('Refresh token error:', error);
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { userId } = req.user;
      await User.update(
        { refreshToken: null },
        { where: { id: userId } }
      );
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      logger.error('Logout error:', error);
      next(error);
    }
  }

  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        email: user.email,
        role: user.Role?.name || 'user'
      },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || 'refresh_secret_key',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );
  }
}

module.exports = new AuthController();