const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema} = require("../schema.js")
const Listing = require("../models/listing.js");

//VALIDATE LISTING
const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    
    if(error) {
        let errMsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError(400, errMsg); 
    } else {
        next();
    }
}

//Index route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({})
    res.render("listings/index.ejs", {allListings});
}));

//New Route
router.get("/new", wrapAsync( (req, res) => {
    res.render("listings/new.ejs")
}));

//Show route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
}));

//Create route
router.post("/",validateListing, wrapAsync (async (req, res, next) => {
        
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        req.flash("success", "New listing created!");
        res.redirect("/listings");
})
    
);

//Edit Route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
}));

//Update route
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
   
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash("success", "listing Updated");
    res.redirect(`/listings/${id}`);
}));

//Delete route
router.delete("/:id", wrapAsync( async (req, res) => {
   let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "listing deleted");
    res.redirect("/listings");
}));



module.exports = router;