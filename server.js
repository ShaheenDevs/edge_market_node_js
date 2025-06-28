require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
// const cron = require('node-cron');
const cors = require('cors');
const mainRoute = require('./routes/main');
const Sequelize = require('sequelize');

// Load Sequelize config based on the environment
const environment = process.env.NODE_ENV || 'development';

const password = process.env.DB_PASSWORD === 'null' ? null : process.env.DB_PASSWORD;
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, password, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
});

const app = express();
const port = process.env.PORT || 7000;

// Enable CORS for all origins, methods, and allowed headers
const corsOptions = {
    origin: '*',
    // methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'], 
};

// Use CORS middleware
app.use(cors(corsOptions));

// Use body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use the main routes file
app.use(mainRoute);

// Synchronize the database
sequelize.sync({ alter: true }).then(() => {
    console.log('Database synchronized');
}).catch(error => {
    console.error('Error synchronizing the database:', error);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port} in ${environment} mode`);
});
