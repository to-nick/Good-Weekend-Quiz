const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors")

const dataRouter = require('./routes/data/data.js');
const usersRouter = require('./routes/users/users.js');
const profileRouter = require('./routes/profile/profile.js')

const options = require('./knexfile.js');
const knex = require('knex')(options);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Setting cors parameters
const allowedOrigins = ['https://good-weekend-quiz-frontend.onrender.com' ,'http://localhost:3000']

const corsOptions = {
  origin: (origin, callback) => {
    if(!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    }else {
      callback(new Error('Not allowed by CORS'))
    }
  } ,
  methods: "GET, POST, DELETE"
}
app.use(cors(corsOptions))
app.use((req, res, next) => {
  req.db = knex
  next()
  });

//Routes for use across the backend
app.use('/data', dataRouter);
app.use('/users', usersRouter);
app.use('/profile', profileRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
