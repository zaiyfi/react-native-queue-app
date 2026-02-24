const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

// const { seedAdmin } = require('./controllers/authController');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/queues', require('./routes/queueRoutes'));

// // Auto-seed admin on server start (for development)
// seedAdmin().catch(console.error);

app.listen(5000, () => console.log('Server running on port 5000'));

logger.info('Server started');