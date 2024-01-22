var express = require('express');
var router = express.Router();

const userModel = require("./users");
const postModel = require("./posts");
const passport = require('passport');
const upload = require('./multer');

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));


router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/login', function(req, res, next) {
  res.render('login',{error: req.flash('error')});
});

router.get('/feed', isLoggedIn, async function(req, res, next) {
  const posts = await postModel.find({}).populate('user').exec();
  
  function getRandomClass() {
    const classes = ['card_small', 'card_medium', 'card_large'];
    const randomNumber = Math.floor(Math.random() * classes.length);
    return classes[randomNumber];
  }

  res.render('feed',{posts, getRandomClass});
});

router.post('/upload', isLoggedIn, upload.single("file"), async function(req, res, next) {
  if(!req.file) {
    return res.status(400).send('No files were uploaded. ');
  }
  const user = await userModel.findOne({username: req.session.passport.user});
  const post = await postModel.create({
    image: req.file.filename,
    imageText: req.body.fileCaption,
    user: user._id
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.get('/profile', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  .populate("posts")

  function getRandomClass() {
    const classes = ['card_small', 'card_medium', 'card_large'];
    const randomNumber = Math.floor(Math.random() * classes.length);
    return classes[randomNumber];
  }
  res.render("profile",{user, getRandomClass});
});

router.post("/register", function(req, res){
  const {fullname, username, email} = req.body;
  const userData = new userModel({
    fullname, username, email})

    userModel.register(userData, req.body.password)
    .then(function(){
      passport.authenticate("local")(req, res, function(){
        res.redirect("/profile");
      })
    })
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/feed",
  failureRedirect: "/login",
  failureFlash: true
}), function(req, res){
});

router.get("/logout", function(req, res) {
  req.logout(function(err) {
    if(err) {
      return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) return next();
  res.redirect("/login");
}



module.exports = router;
