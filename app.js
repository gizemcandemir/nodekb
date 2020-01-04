const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

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

// Add Route
app.get('/articles/add', (req, res) => {
  res.render('add_article', {
    title: 'Add Article'
  });
});

// Start Server
app.listen(3000, () => console.log('Server started no 3000...'));