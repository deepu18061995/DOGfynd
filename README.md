# DOGfynd
ROUTE CONFIG
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


//============================================================
THESE ARE SOME OF MY TEMPLATES YOU CAN USE FOR YOUR PROJECT
//============================================================

========= HOME PAGE ==========

<% include ./partials/header %>
<div class="container">
 <div class="jumbotron text-white rounded bg-dark">
        <div class="col-md-10 px-0">
          <h1 class="display-6 font-italic">ANIMALS</h1>
          <p class="lead my-4">Animals, they are one of the most beautiful gifts we have and, you know, if there are people that have compassion, there are very few people that put their money into animal rescue organizations. And if there is someone that has that passion, animals need all the help they can get.</p>
         
        </div>
      </div>
      
      <div class="row flex">
          <% dog.forEach(function(dogs){ %>
            <div class="col-md-4">
                
              <div class="card mb-4 box-shadow">
                <img class="card-img-top" src="<%=dogs.image%>" alt="Card image cap">
                <div class="card-body">
                  <p class="card-text"><%=dogs.description%></p>
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="btn-group">
                      <a href="/home/<%=dogs._id%>" class="btn btn-sm btn-outline-secondary">View More</a>
                    </div>
                    <small class="text-muted"><%=dogs.created.toDateString()%></small>
                  </div>
                   
                </div>
               
              </div>
              
            </div>
            <% }) %>
        
</div>      

======== LOGIN PAGE ==============


<%include ./partials/header%>
<div class="container">
    <h2 style="text-align:center; margin:60px 20px 20px 20px;">Login</h2>
    <div style="width:40%; margin:0 auto;">
    <form action="/login" method="post">
      

      <div class="form-group">
        <input type="text" class="form-control" placeholder="username" name="username" required>
    
      </div>

      <div class="form-group">
        <input type="password" class="form-control" placeholder="password" name="password" required>
        
      </div>
      <button class="btn btn-lg btn-primary btn-block" type="submit">Submit</button>
      <a class="btn btn-lg btn-success btn-block" href="/register">Not A User? Register Here</a>
      <p class="mt-5 mb-3 text-muted text-center">&copy; 2018-2019</p>
    </form>
    </div>
</div> 
     
YOU CAN USE THE SAME TEMPLATE FOR REGISTER PAGE JUST CHANGE THE NAME ATTRIBUTE OF INPUT TAGS

============== SHOW PAGE ==================
<% include ./partials/header %>
    <div class="container" style="margin:40px auto;">

      <div class="row">

        <div class="col-lg-3">
          <h1 class="my-4"><%=dog.name%></h1>
          <div class="list-group">
            <a  class="list-group-item">Phone: <%=dog.contact%></a>
            <a  class="list-group-item">Posted on: <%=dog.created.toDateString()%></a>
            <a  class="list-group-item">price: Rs <%=dog.price%>/-</a>
          </div>
          <a href="/home" class="btn btn-lg btn-success my-4">Back To Homepage</a>
        </div>
        <!-- /.col-lg-3 -->

        <div class="col-lg-9">

          <div class="card mt-4">
            <img class="card-img-top" src="<%=dog.image%>" alt="" style="height:60%; width:60%; margin:auto auto;">
            <div class="card-body">
              <h3 class="card-title"><%=dog.breed%></h3>
              <h4>Rs <%=dog.price%>.00/-</h4>
              <p class="card-text"><%=dog.description%></p>
              <span class="text-warning">&#9733; &#9733; &#9733; &#9733; &#9734;</span>
              4.0 stars
            </div>
          </div>
          <!-- /.card -->

          <div class="card card-outline-secondary my-4">
            <div class="card-header">
              Comments
            </div>
            
            
            <div class="card-body">
            <%dog.comment.forEach(function(comment){ %>
                
              <p><%=comment.text%></p>
              <small class="text-muted">Posted by-<%=comment.author%></small>
              <hr>
              
            <% }) %>

              <a href="/home/<%=dog._id%>/comment/new" class="btn btn-success">Leave a Review</a>
            </div>
          </div>
          <!-- /.card -->

        </div>
        <!-- /.col-lg-9 -->

      </div>




