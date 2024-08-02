const Listing=require("./models/listing");
const Review=require("./models/review.js")
const { listingSchema,reviewSchema } = require("./Schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        //redirectUrl
        // we dont use this in session because after our authenticate function results true in /login route it automaticall resets the session, so this data stored in session will get deleted
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","Login is Required!");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl; 
    }
    next();
};

module.exports.isOwner=async(req,res,next)=>{
    let { id } = req.params;
    let listing=await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error","Only listing owner is authorized to perform this action");
        return res.redirect(`/listings/${id}`);
    }
    next(); 
}

module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
      let { errMsg } = error.details
        .map((el) => {
          el.message;
        })
        .join(",");
      throw new ExpressError(400, errMsg);
    } else {
      next();
    }
  };

module.exports.validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let {errMsg}=error.details.map((el)=>{el.message}).join(","); 
        throw new ExpressError(400,errMsg);
    }else{
        next(); 
    }
}


module.exports.isReviewAuthor=async(req,res,next)=>{
  let { id,reviewId } = req.params;
  let review=await Review.findById(reviewId);
  if(!review.author._id.equals(res.locals.currUser._id)){
      req.flash("error","Only review creator is authorized to perform this action");
      return res.redirect(`/listings/${id}`);
  }
  next(); 
}