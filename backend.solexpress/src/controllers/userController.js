const sqlService = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/response');
const { LoginResponse } = require('../models/response/userResponse');
const { User } = require('../models/user');
const { LoginRequest } = require('../models/request/user');

const loginUser = async (req, res) => {
  const { username, password } = new LoginRequest(req.body);
  try {
    const [users] = await sqlService.query('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      return res.json(
        ApiResponse.badRequest('Invalid username or password')
      );
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.Password);

    if (!validPassword) {
      return res.json(
        ApiResponse.badRequest('Invalid username or password')
      );
    }

    if (!user.IsActive) {
      return res.json(
        ApiResponse.badRequest('Account is inactive')
      );
    }

    if (user.IsDeleted) {
      return res.json(
        ApiResponse.badRequest('Account is deleted')
      );
    }

    const token = jwt.sign(
      { id: user.Id, username: user.Username, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const response = new LoginResponse(token, new User(user));

    res.json(ApiResponse.success(response, 'Login successful'));
  } catch (error) {
    res.status(500).json(
      ApiResponse.error(error.message)
    );
  }
};

const registerUser = async (req, res) => {
  const { name, username, password, role } = req.body;
  const creatorUsername = req.user.username;

  try {
    const [existingUsers] = await sqlService.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json(
        ApiResponse.badRequest('Username already registered')
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await sqlService.query(
      'INSERT INTO users (name, username, password, role, createdBy, updatedBy) VALUES (?, ?, ?, ?, ?, ?)',
      [name, username, hashedPassword, role, creatorUsername, creatorUsername]
    );

    res.status(201).json(
      ApiResponse.created(null, 'User created successfully')
    );
  } catch (error) {
    res.status(500).json(
      ApiResponse.error(error.message)
    );
  }
};

module.exports = { registerUser, loginUser };