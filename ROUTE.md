# DOGfynd
ROUTE SETUP FOR NODE USING EXPRESS
var express=require("express");
var app=express() ;
var bodyparser = require("body-parser");
var mongoose=require("mongoose");
var dog=require("./models/dog");
var comment=require("./models/comment");
var passport=require("passport");
var localstrategy=require("passport-local");
var User=require("./models/user");

mongoose.connect('mongodb://localhost:27017/dogfind', { useNewUrlParser: true });

app.set("view engine", "ejs");
app.use(bodyparser.urlencoded({extended:true}));

//==================================
//PASSPORT CONFIGURATION
//==================================

app.use(require("express-session")({
    secret:"chinki is my favourite dog",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});

//===================================
//ROUTES CONFIG
//===================================

app.get("/", function(req, res){
   res.render("index"); 
});

app.get("/home", function(req, res){
    dog.find({}, function(err, dogs){
        if(err){
            console.log(err)
        }else{
            res.render("home", {dog:dogs})
        }
    })
});

app.get("/sell", function(req, res){
   res.render("sell"); 
});

app.post("/home", function(req, res){
  dog.create(req.body.dog, function(err, newdog){
      if(err){
          res.redirect("/sell");
      }else{
          res.redirect("/home");
      }
  }) 
});

app.get("/home/:id", function(req, res){
   dog.findById(req.params.id).populate("comment").exec(function(err, founddog){
       if(err){
           res.redirect("home")
       }else{
           res.render("show",{dog:founddog})
       }
   }) 
});

app.get("/home/:id/comment/new",isloggedin,  function(req, res){
    dog.findById(req.params.id, function(err, dog){
        if(err){
            res.redirect("home");
        }else{
              res.render("comment", {dog:dog});
        }
    });
  
});

app.post("/home/:id/comment", function(req, res){
   dog.findById(req.params.id, function(err, dog){
       if(err){
           console.log(err)
       }else{
           comment.create(req.body.comment, function(err, comment){
               if(err){
                   console.log(err)
               }else{
                   dog.comment.push(comment)
                   dog.save()
                   res.redirect("/home/" +dog._id)
               }
           })
       }
   }) 
});


//===================
//AUTH ROUTES
//===================

app.get("/register", function(req, res){
   res.render("register") 
});

app.post("/register", function(req, res){
    var newUser= new User({username:req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.render("register");
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/home");
            });
        }
    });
});

app.get("/login", function(req, res){
   res.render("login") 
});

app.post("/login",passport.authenticate("local", 
{
    successRedirect:"/home",
    failureRedirect:"/login"}), function(req, res){
        
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/home")
})

function isloggedin(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("server has been started!!!!");
});
