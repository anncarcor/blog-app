//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const homeStartingContent = "Hello and welcome to my journal, this is a blog application where you can read and comment on blog posts. Hope you enjoy your stay! I hope to share some of my thoughts while I am on this journey towards becoming a proficient web developer. I am looking forward to sharing it with you.";
const aboutContent = "My name is Caroline and I built this blog application. This blog application was built using node.js and mongodb to store blogposts. During the development of this application I also added functionalities such as a delete and edit function, that way you can both delete posts your not happy with or somply just edit them. The design was implemented by using Bootstrap 5 in ordert to create a coherent and simple layout.";
const contactContent = "If you want to know more about me please do not hesitate to contact me by filling out the form below!";

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/blogDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);

//Create blog posts stored in db
const postSchema = {
  title: "String",
  content: "String",
  createdAt: {
    type: Date,
    default: Date.now
  }
};

const Post = mongoose.model("Post", postSchema);


///////// GET routes //////////
app.get("/", function(req, res){

  const sortDate = {createdAt: -1};

  Post.find({}, function(err, posts){
    if(!err){
    res.render("home", {
      startingContent: homeStartingContent, 
      posts: posts
    });
  }

  }).sort(sortDate);

});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.get("/posts/:postId", function(req, res){
const requestedPostId = req.params.postId;
Post.findOne({_id: requestedPostId}, function(err, post){
  if (!err){
      res.render("post", {
      title: post.title,
      content: post.content
    });
  }
});
});

app.get("/editlist", function(req, res){
  const sortDate = {createdAt: -1};
  Post.find({}, function(err, posts){
    if(!err){
    res.render("editlist", {
      posts: posts
    });
  }
  }).sort(sortDate);
});

app.get("/edit/:postId", function(req, res){
  const requestedPostId = req.params.postId;
  Post.findOne({_id: requestedPostId}, function(err, post){
    if (!err){
        res.render("edit", {
        title: post.title,
        content: post.content,
        id: post._id
      });
    }
  });
  });



///////// POST routes //////////
app.post("/compose", function(req, res){
  const post = new Post({
    title: req.body.postTitle,
    content:  req.body.postBody
  });
  post.save(function(err){
    if(!err){
      res.redirect("/");
    }
  });

});



///// UPDATE ///////
app.post("/update", function(req, res){
  const checkBoxId = (req.body.checkbox);
  const update = {
    title: req.body.editTitle,
    content: req.body.editBody
  };
  Post.findByIdAndUpdate(checkBoxId, update, function(err){
    if(!err){
      res.redirect("/");
    }
  });
});

////// DELETE //////
app.post("/delete", function (req, res) {
  const clickedPostId = req.body.checkbox;
  Post.findByIdAndRemove(clickedPostId, function(err){
    if (!err){
      res.redirect("/");
    }
  });
});


//// CONTACT FORM ///////

app.post("/contact", function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const subject = req.body.subject;
  const message = req.body.message;

  const transporter = nodemailer.createTransport({
   service: 'gmail',
    auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS
  }
});


const mailOptions = {
  from: email,
  to: process.env.EMAIL,
  subject: subject,
  html: "Name of sender: " + name + " <br> Their message: " + message + " <br> Their email: " + email
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    res.render("error");
    console.log(error);
  } else {
    res.render("success");
  }
});
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
