const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

const app = express();

// connect to database
connectDB();

// Body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json({extended: false}));

app.get('/', (request, response) => response.send("Hello World!"));

app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

const port = process.env.Port || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));