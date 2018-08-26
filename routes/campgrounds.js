var express    = require("express"),
    router     = express.Router(),
    Campground = require("../models/campground"),
    middleware = require("../middleware");

//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campground:allCampgrounds, currentUser: req.user});
       }
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name          = req.body.name;
    var image         = req.body.image;
    var desc          = req.body.desc;
    var author        = {
        id: req.user._id,
        username: req.user.username
    }
    var price         = req.body.price;
    var newCampground = {name: name, image: image, description: desc, author: author, price: price }
    // Create a new campground and save to DB
    Campground.create(newCampground, function(error, newlyCreated){
        if(error){
            console.log(error);
        } else {
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

//SHOW - shows more info about campground
router.get("/:id", function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(error, foundCampground){
        if(error){
            console.log(error)
        }else {
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
   Campground.findById(req.params.id, function(err, foundCampground) {
       if(err){
           req.flash("error", "Campground not found");
       }
       res.render("campgrounds/edit", {campground: foundCampground});
   });
});

//UPDATE Route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
      if(err){
          res.redirect("/campground");
      } else {
          res.redirect("/campgrounds/" + req.params.id);
      }
   }); 
});
//Destroy route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
   Campground.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/campgrounds");
       } else {
           res.redirect("/campgrounds");
       }
   });
});

module.exports = router;