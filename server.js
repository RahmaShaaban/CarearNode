const sequelize = require('./backend/config/database');

// Test Database Connection
sequelize.authenticate()
    .then(() => console.log('Database connected successfully...'))
    .catch(err => console.log('Error: ' + err));

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('CarearNode Server is Running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

const Department = require('./backend/models/Department');

sequelize.sync({ alter: true })
    .then(() => console.log(' Database & Tables synced!'))
    .catch(err => console.error(' Sync error:', err));

const authRoutes = require('./backend/routes/authRoutes');

app.use(express.json());
app.use('/api/auth', authRoutes);

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));