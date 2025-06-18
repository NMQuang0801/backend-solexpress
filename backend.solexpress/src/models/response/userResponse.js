class LoginResponse {
  constructor(token, user) {
    this.token = token;
    this.user = user;
  }
}

module.exports = { LoginResponse };