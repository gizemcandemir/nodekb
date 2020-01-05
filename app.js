const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { check, validationResult, validationErrors } = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');


mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

// Check connection
db.once('open', () => console.log(`Connected to MongoDB`));

// Check for db errors
db.on('error', (err) => console.log(err));

// Init app
const app = express();

// Bring in Models
let Article = require('./models/article')

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser Middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// Set public folder
app.use(express.static(path.join(__dirname, 'public')))

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express - validator orneginde vardi:
app.use(express.json());

// Home route
app.get('/', (req, res) => {
  Article.find({}, (err, articles) =>{
    if (err) console.log(err);
    res.render('index', {
      title: 'Articles',
      articles: articles
    });
  });
});

// Get Single Article
app.get('/article/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    res.render('article', {
      article: article
    });
  });
});

// Add Route
app.get('/articles/add', (req, res) => {
  res.render('add_article', {
    title: 'Add Article'
  });
});

// Add Submit POST Route

app.post('/articles/add', [
  check('title', 'Title is required').notEmpty(), 
  check('author', 'Author is required').notEmpty(), 
  check('body', 'Body is required').notEmpty()
], (req, res) => {
  // Get Errors
  const errors = validationResult(req);
  if (!errors.isEmpty()){
    res.render('add_article', {
      errors:errors
    });
    // return res.status(422).json({ errors: errors.array() });
  }
  let article = new Article();
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;
  
  article.save((err) => {
    if (err) {
      console.log(err);
      return
    } 
    req.flash('success', 'Article Added');
    res.redirect('/')
  })
})

// Load Edit Form
app.get('/article/edit/:id', (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    res.render('edit_article', {
      title:'Edit Article',
      article: article
    });
  });
});

// Update Submit POST Route
app.post('/articles/edit/:id', (req, res) => {
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;
  
  let query = {_id:req.params.id}

  Article.update(query, article, (err) => {
    if (err) {
      console.log(err);
      return
    } else {
      req.flash('success', 'Article Edited');
      res.redirect('/')
    };
  });
});

// Delete post
app.delete('/article/:id', (req, res) => {
  let query = {_id:req.params.id}

  Article.remove(query, (err) => {
    if (err) console.log(err);
    req.flash('danger', 'Article Deleted');
    res.send('Success');
  })
})

// Start Server
app.listen(3000, () => console.log('Server started no 3000...'));