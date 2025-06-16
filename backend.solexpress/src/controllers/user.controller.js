const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/response');

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      return res.json(
        ApiResponse.badRequest('Invalid username or password')
      );
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.json(
        ApiResponse.badRequest('Invalid username or password')
      );
    }

    if (!user.isActive) {
      return res.json(
        ApiResponse.badRequest('Account is inactive')
      );
    }

    if (user.isDeleted) {
      return res.json(
        ApiResponse.badRequest('Account is deleted')
      );
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userData = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role
    };

    res.json(
      ApiResponse.success(
        { token, user: userData },
        'Login successful'
      )
    );
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
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUsers.length > 0) {
      return res.status(400).json(
        ApiResponse.badRequest('Username already registered')
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await pool.query(
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