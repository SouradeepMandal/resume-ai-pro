const dns = require("node:dns/promises");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const users = await User.find({ email: { $exists: true } }).sort({ createdAt: -1 }).limit(10);
    console.log('Most recent registered users:');
    users.forEach(u => console.log(u.email, '-> OTP:', u.otp, 'verified:', u.isVerified));
    process.exit(0);
  });
