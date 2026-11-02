const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
dotenv.config();

console.log("JWT_SECRET", process.env.JWT_SECRET)
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
module.exports = generateToken;
