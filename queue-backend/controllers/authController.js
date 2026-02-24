const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

exports.signup = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: 'User already exists' });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role (default to 'user' if not specified)
    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || 'user',
    });

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    // Generate token with role
    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// // Seed demo admin (for development only)
// exports.seedAdmin = async (req, res) => {
//   try {
//     console.log('Seeding admin user...');
//     const adminEmail = 'admin@queue.com';
//     const adminPassword = 'Admin@123';

//     // Check if admin already exists
//     let admin = await User.findOne({ email: adminEmail });

//     if (admin) {
//       return res.json({
//         message: 'Admin already exists',
//         email: admin.email,
//         role: admin.role,
//       });
//     }

//     // Hash the admin password
//     const hashedPassword = await bcrypt.hash(adminPassword, 10);

//     // Create admin user
//     admin = await User.create({
//       email: adminEmail,
//       password: hashedPassword,
//       role: 'admin',
//     });

//     res.status(201).json({
//       message: 'Admin created successfully',
//       email: admin.email,
//       role: admin.role,
//       demoCredentials: {
//         email: adminEmail,
//         password: adminPassword,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };
