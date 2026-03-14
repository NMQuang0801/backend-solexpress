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
    const [users] = await sqlService.query(
      'SELECT Id, Name, Username, Password, Role, IsActive, IsDeleted FROM users WHERE Username = ? LIMIT 1',
      [username]
    );

    if (!users.length) {
      return ApiResponse.badRequest(res, 'Tài khoản hoặc mật khẩu không đúng.');
    }

    const user = users[0];

    if (!user.IsActive) {
      return ApiResponse.badRequest(res, 'Tài khoản đã ngưng hoạt động.');
    }

    if (user.IsDeleted) {
      return ApiResponse.badRequest(res, 'Tài khoản đã xóa.');
    }

    const validPassword = await bcrypt.compare(password, user.Password);
    if (!validPassword) {
      return ApiResponse.badRequest(res, 'Tài khoản hoặc mật khẩu không đúng.');
    }

    const token = jwt.sign(
      { id: user.Id, username: user.Username, role: user.Role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const data = new LoginResponse(token, new User(user));
    return ApiResponse.success(res, data, 'Đăng nhập thành công.');
  } catch (error) {
    console.error('Login error:', error);
    return ApiResponse.serverError(res, error.message);
  }
};

const registerUser = async (req, res) => {
  const { name, username, password, role } = req.body;
  const creatorUsername = req.user.username;

  try {
    const [existingUsers] = await sqlService.query(
      'SELECT Id FROM users WHERE Username = ? LIMIT 1',
      [username]
    );

    if (existingUsers.length > 0) {
      return ApiResponse.badRequest(res, 'Tài khoản đã tồn tại.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await sqlService.query(
      'INSERT INTO users (Name, Username, Password, Role, CreatedBy, UpdatedBy) VALUES (?, ?, ?, ?, ?, ?)',
      [name, username, hashedPassword, role, creatorUsername, creatorUsername]
    );

    return ApiResponse.created(res, null, 'Đăng ký tài khoản thành công.');
  } catch (error) {
    console.error('Register error:', error);
    return ApiResponse.serverError(res, error.message);
  }
};

module.exports = { registerUser, loginUser };
