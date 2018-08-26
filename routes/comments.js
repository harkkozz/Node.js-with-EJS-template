var express = require("express"),
    router  = express.Router({mergeParams: true}),
    Campground = require("../models/campground"),
    Comment    = require("../models/comment"),
    middleware = require("../middleware");

//Comments new
router.get("/new", middleware.isLoggedIn, function(req, res){
    Campground.findById(req.params.id, function(error, campground){
        if(error){
            console.log(error);
        }else {
            res.render("comments/new", {campground: campground});
        }
    });
});

//Comments create
router.post("/", middleware.isLoggedIn, function(req, res){
    //lookup campground using ID
    Campground.findById(req.params.id, function(error, campground) {
       if(error){
           console.log(error);
           res.redirect("/campgrounds");
       } else {
           Comment.create(req.body.comment, function(error, comment){
               if(error){
                   req.flash("error", "Something went wrong!");
                   console.log(error);
               }else {
                   //add username and id to comment
                   comment.author.id = req.user._id;
                   comment.author.username = req.user.username;
                   //save comment
                   comment.save();
                   campground.comments.push(comment);
                   campground.save();
                   req.flash("success", "Successfully created comment!");
                   res.redirect("/campgrounds/" + campground._id);
               }
           })
       }
    });
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(error, foundCampground) {
        if(error || !foundCampground){
            req.flash("error", "Campground not found");
            return res.redirect("back");
        }
        Comment.findById(req.params.comment_id, function(err, foundComment){
          if(err){
              res.redirect("back");
          } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
          }
        });
    });
});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCampgroundOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back");
      } else {
          req.flash("success", "Successfully updated comment");
          res.redirect("/campgrounds/" + req.params.id );
      }
   });
});

//Comment DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCampgroundOwnership, function(req, res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       }else {
           req.flash("success", "Comment deleted!");
           res.redirect("/campgrounds/" + req.params.id);
       }
   }) 
});

module.exports = router;