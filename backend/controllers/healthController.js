const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const health = asyncHandler(async (req, res) => {
  const ok = mongoose.connection.readyState === 1;
  res.status(ok?200:503).json({ status:ok?'ok':'degraded', uptime:`${Math.floor(process.uptime())}s`, env:process.env.NODE_ENV, db:ok?'connected':'disconnected' });
});
module.exports = { health };
