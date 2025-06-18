class User {
  constructor({ id, name, username, role }) {
    this.id = id;
    this.name = name;
    this.username = username;
    this.role = role;
  }
}

module.exports = { User };