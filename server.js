var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var app = express();
var request = require("request");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// = Middleware (pass everything through the logger first) ================================================
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static('public')); // (create a public folder and end up there)

// = Database configuration ================================================
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
var db = mongoose.connection;

db.on('error', function (err) {
    console.log('Mongoose Error: ', err);
});
db.once('open', function () {
    console.log('Mongoose connection successful.');
});

// = Require Schemas ================================================================
var Note = require('./models/note.js');
var Article = require('./models/article.js');

// = Routes ================================================================
app.get('/', function(req, res) {
  res.send(index.html); // sending the html file
});

app.get('/scrape', function(req, res) {
request('https://www.irishcentral.com', function(error, response, html) {
var $ = cheerio.load(html);
$('article h2').each(function(i, element) {

            var result = {};

            result.headline = $(this).children('a').text();
            result.summary = $(this).children('a').attr('href');

            var entry = new Article (result);

            entry.save(function(err, doc) {
              if (err) {
                console.log(err);
              } else {
                console.log(doc);
              }
            });


});
});
res.send("Scraped");
});


app.get('/articles', function(req, res){
Article.find({}, function(err, doc){
    if (err){
        console.log(err);
    } else {
        res.json(doc);
    }
});
});


app.get('/articles/:id', function(req, res){
Article.findOne({'_id': req.params.id})
.populate('note')
.exec(function(err, doc){
    if (err){
        console.log(err);
    } else {
        res.json(doc);
    }
});
});


app.post('/articles/:id', function(req, res){
var newNote = new Note(req.body);

newNote.save(function(err, doc){
    if(err){
        console.log(err);
    } else {
        Article.findOneAndUpdate({'_id': req.params.id}, {'note':doc._id})
        .exec(function(err, doc){
            if (err){
                console.log(err);
            } else {
                res.send(doc);
            }
        });

    }
});
});


app.listen(process.env.PORT || 3000, function() {
console.log('App running on port 3000!');
});