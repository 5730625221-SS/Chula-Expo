const express = require('express');
const favicon = require('serve-favicon');
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');
// logger and utility
const logger = require('morgan');
const chalk = require('chalk');
// database and passport
const mongoose = require('mongoose');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
// SASS
const sass = require('node-sass-middleware');
// Route
const home = require('./routes/home');
const api = require('./routes/api');

// Load envirountment variables from .env file
dotenv.load({ path: '.env' });

// Set up MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗')); // eslint-disable-line no-console
  process.exit();
});

const app = express();

// Set Express
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'routes'));
app.set('view engine', 'ejs');
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());

// Set favicon using serve-favicon at /public/favicon.icon
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));
// Set '/public' as static Routes
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

// Set Route
app.use('/', home.route);

// API
app.use('/api', api);

app.listen(app.get('port'), (err) => {
  if (err) {
    throw err;
  }
  console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env')); // eslint-disable-line no-console
});

module.exports = app;