/** ----------------------------------------------------------------------- **/
// Dependencies
/** ----------------------------------------------------------------------- **/
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

// Serve Static Files
app.use(express.static('public'))

// Connect local MongoDB
mongoose.connect("mongodb://localhost:27017/storytree", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

// Check Connection
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("DB Connected!");
});

// Set up ejs
app.set('view engine', 'ejs');
// Set up body-parser
app.use(bodyParser.urlencoded({
  extended: true
}));

/** ----------------------------------------------------------------------- **/
// MongoDB Schemas & Models
/** ----------------------------------------------------------------------- **/
const contributionSchema = new mongoose.Schema({
  author: String,
  content: String
});

const Contribution = new mongoose.model("Contribution", contributionSchema);

// Set Up Tree
const treeSchema = new mongoose.Schema({
  name: String,
  owner: String,
  password: String,
  contributions: [contributionSchema]
});

const Tree = new mongoose.model("Tree", treeSchema);

/** ----------------------------------------------------------------------- **/
// Testing Samples
/** ----------------------------------------------------------------------- **/
const testContribution = new Contribution({
  author: "Jimmy",
  content: "Man and God met somewhere. Both exclaimed \"My creater!\""
});

// testContribution.save( function(err) {
//   if (err) console.log("Error Saving!");
// })

const testSample = [testContribution];

const testTree = new Tree({
  name: "The Reluctant Executioner",
  owner: "PickleRick",
  password: "test",
  contributions: testSample
})

// testTree.save( function (err) {
//   if (err) console.log("Error Saving!");
// })

/** ----------------------------------------------------------------------- **/
// Routing
/** ----------------------------------------------------------------------- **/

/** ------------------------------------------------------------------ Root **/
// GET
app.get("/", function(req, res) {
  Tree.find({}, function(err, docs) {
    if (docs.length > 0) {
      res.render("index", {
        trees: docs
      });
    } else res.redirect("/create");
  });
});

/** ---------------------------------------------------------------- Create **/
// GET Create
app.get("/create", function(req, res) {
  res.render("create");
});

// POST Create
app.post("/create", function(req, res) {
  // Create Tree
  const newTree = new Tree({
    name: req.body.treeName,
    password: req.body.password,
    owner: req.body.userName
  });
  // Create Contribution
  const pilot = new Contribution({
    author: req.body.userName,
    content: req.body.pilot
  });
  // Save Contribution
  pilot.save(function(err) {
    if (err) console.log("Error Saving!");
  });
  // Add Contribution
  newTree.contributions.push(pilot);
  // Save Tree
  newTree.save(function(err) {
    if (err) console.log("Error Saving!");
  });
  res.redirect("/");
});

/** ----------------------------------------------------------------- Input **/
// GET Input/treeID
app.get("/input/:treeID", function(req, res) {
  // Find Tree
  Tree.findOne({
    _id: req.params.treeID
  }, function(err, tree) {
    if (tree && !err) {
      // Render Tree
      res.render("input", {
        tree: tree,
        count: tree.contributions.length
      });
      // Redirect
    } else {
      res.redirect("/");
    }
  });
});

// POST Input
app.post("/input", function(req, res) {
  // Find Tree
  Tree.findOne({
    _id: req.body.treeID
  }, function(err, tree) {
    if (tree && !err) {
      // Create Contribution
      const newContribution = new Contribution({
        author: req.body.nickname,
        content: req.body.content
      });
      // Save Contriburion
      newContribution.save(function(err) {
        if (err) console.log("Error Saving!");
      });
      // Add Contribution
      tree.contributions.push(newContribution);
      // Save Tree
      tree.save(function(req, res) {
        if (err) console.log("Error Saving!");
      });
      res.redirect("/");
      // Redirect
    } else {
      res.redirect("/");
    }
  });
});

/** ------------------------------------------------------------------ View **/
// GET View/treeID
app.get("/view/:treeID", function(req, res) {
  // Find Tree
  Tree.findOne({
    _id: req.params.treeID
  }, function(err, tree) {
    if (tree && !err) {
      res.render("view", {
        tree: tree
      });
    } else {
      res.redirect("/");
    }
  });
});



/** ----------------------------------------------------------------------- **/
// Start listener
/** ----------------------------------------------------------------------- **/
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
