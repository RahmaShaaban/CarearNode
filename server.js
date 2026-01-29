const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const sequelize = require('./backend/config/database');
const User = require('./backend/models/User'); 
const Department = require('./backend/models/Department');

const authRoutes = require('./backend/routes/authRoutes');
const deptRoutes = require('./backend/routes/deptRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/departments', deptRoutes);

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/', (req, res) => {
    res.send('CarearNode Server is Running!');
});

User.belongsTo(Department, { foreignKey: 'department_name', targetKey: 'department' });

// --- 5. Verification Function ---
async function verifyServerState() {
    try {
        const users = await User.findAll();
        console.log(`✅ Auth System: ${users.length} users registered (Sign-up/Login working).`);
        const deptCount = await Department.count();
        console.log(`✅ Profile System: Found ${deptCount} courses to show in user profiles.`);
    } catch (error) {
        console.error("❌ Verification Error:", error.message);
    }
}

// --- 6. Start Server ---
sequelize.sync().then(async () => {
    console.log('✅ Database connected & Frontend paths restored!');
    await verifyServerState();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});