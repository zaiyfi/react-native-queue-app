const express = require('express');
const router = express.Router();
const { signup, login, seedAdmin } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
// Development route to create admin user
// router.post('/seed-admin', seedAdmin);

module.exports = router;
