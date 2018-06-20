var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// additional packages
var axios = require("axios");
var cheerio = require("cheerio");

// Connect to the Mongo DB
mongoose.Promise = Promise;
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoosescraper";
mongoose.connect(MONGODB_URI);



//
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();


// User logger
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Routes
app.get("/scrape", function(req, res) {
  axios.get("http://www.irishcentral.com/").then(function(response) {
    var $ = cheerio.load(response.data);
    $("h2").each(function(i, element) {
      var result = {};
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Get new article from Scrape
      db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          return res.json(err);
        });
    });

    
    res.send("Scrape Complete");
  });
});

// Get all articles from DB
app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for gettin the article
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route 
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
