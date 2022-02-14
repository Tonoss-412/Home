if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }

const express = require("express");
const mongoose = require("mongoose");
const app = express();
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const multer = require('multer');
const errorHandler = require('errorhandler');
const favicon = require('serve-favicon');           
const logger = require('morgan');                        
const bodyParser = require('body-parser');                           

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []
// ! connect to the mongodb database...
mongoose.connect(
    "mongodb://localhost/blog_tut",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log("Connection to mongodb database was successful!");
  }
);

// middlewares
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(express.cookieParser('secret'));
app.use(express.cookieSession());
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name })
  })

// routes
app.use(require("./routes/index"))
app.use(require("./routes/compose"))
app.use(require("./routes/blog"))



// server configurations are here....
app.listen(3000, () => console.log("Server started listening on port: 3000"));

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}