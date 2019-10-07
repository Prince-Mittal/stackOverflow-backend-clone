const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

//Load Person model
const Person = require('../../models/Person');

//Load Profile Model
const Profile = require('../../models/Profile');

// @type    GET
// @route   /api/profile/
// @desc    route for individual user profile
// @access  PRIVATE

router.get('/', passport.authenticate('jwt', {session: false}), (req,res)=>{
    Profile.findOne({ user: req.user.id})
        .then( profile => {
            if(!profile){
                return res.status(404).json({profilenotfound : 'No profile Found'})
            }
            return res.json(profile);
        })
        .catch(err => console.log('Error in Profile'+err));
});

// @type    POST
// @route   /api/profile/
// @desc    route for Updating and Saving individual user profile data
// @access  PRIVATE

router.post('/', passport.authenticate('jwt', {session: false}), (req,res)=>{
    const profileData = {};
    profileData.user = req.user.id;
    if (req.body.username)
        profileData.username = req.body.username;
    if (req.body.website)
        profileData.website = req.body.website;
    if (req.body.country)
        profileData.country = req.body.country;
    if (req.body.portfolio)
        profileData.portfolio = req.body.portfolio;
    
    if(typeof req.body.languages !== undefined){
        profileData.languages = req.body.languages.split(",");
    }

    //get social links
    profileData.social = {};
    if (req.body.youtube)
        profileData.social.youtube = req.body.youtube;
    if (req.body.facebook)
        profileData.social.facebook = req.body.facebook;
    if (req.body.instagram)
        profileData.social.instagram = req.body.instagram;
    
    //Do database stuff
    Profile.findOne({ user: req.user.id})
        .then(profile => {
            if(profile){
                Profile.findOneAndUpdate(
                    { user: req.user.id},
                    { $set: profileData},
                    { new: true }
                ).then(profile => res.json(profile))
                 .catch(err => console.log('Problem in update'+ err));
            }
            else{
                Profile.findOne({ username: profileData.username})
                    .then(profile => {
                        //Username alreay exists
                        if(profile)
                            res.status(400).json({username : 'username already exists'});
                        //save user
                        new Profile(profileData)
                            .save()
                            .then(profile => res.json(profile))
                            .catch(err => console.log(err));
                    })
                    .catch(err => console.log(err));
            }
        })
        .catch(err => console.log('Problem in fetching profile' + err))
});

// @type    GET
// @route   /api/profile/:username
// @desc    route for getting user profile from USERNAME
// @access  PUBLIC

router.get('/:username', (req,res) => {
    Profile.findOne({ username: req.params.username})
        .populate('user', ['name', "profilepic"])
        .then(profile => {
            if(!profile)
                res.status(404).json({usernotfound: 'User not found'});
            res.json(profile);
        })
        .catch(err => console.log("Error in fetching username "+ err));
});

// @type    GET
// @route   /api/profile/find/everyone
// @desc    route for getting user profile of EVERYONE
// @access  PUBLIC

router.get('/find/everyone', (req, res) => {
    Profile.find()
        .populate('user', ['name', "profilepic"])
        .then(profiles => {
            if (!profiles)
                res.status(404).json({ usernotfound: 'No profile was found' });
            res.json(profiles);
        })
        .catch(err => console.log("Error in fetching users " + err));
});

// @type    DELETE
// @route   /api/profile/
// @desc    route for deleting user based on ID
// @access  PRIVATE

router.delete('/',passport.authenticate('jwt', {session:false}), (req,res) => {
    Profile.findOne({user : req.user.id})
    Profile.findOneAndRemove({ user: req.user.id })
        .then( () => {
            Person.findOneAndRemove({ _id: req.user.id})
                .then( () => {
                    res.json({success: 'User Deleted Successfully'});
                })
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
});

// @type    POST
// @route   /api/profile/workrole
// @desc    route for adding work profile of a person
// @access  PRIVATE

router.post('/workrole', passport.authenticate('jwt', {session:false}), (req,res) => {
    Profile.findOne({user: req.user.id})
        .then(profile => {
            if(!profile){
                res.status(404).json({userNotfound : "Profile not found"});
            }
            const newWork = {
                role: req.body.role,
                company: req.body.company,
                country: req.body.country,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                details: req.body.details
            };
            profile.workrole.unshift(newWork);
            profile.save()
                .then( profile => res.json(profile))
                .catch(err=>console.log(err));
        })
        .catch(err => console.log(err));
});

// @type    DELETE
// @route   /api/profile/workrole/:w_id
// @desc    route for deleting a specific workrole
// @access  PRIVATE

router.delete('/workrole/:w_id', passport.authenticate('jwt', { session: false }), (req,res)=>{
    Profile.findOne({user: req.user.id})
        .then(profile => {
            if(!profile)
                res.status(404).json({profileNotfound: 'Profile not found'});
            const removeRole = profile.workrole
                .map(item => item.id)
                .indexOf(req.params.w_id);

            profile.workrole.splice(removeRole, 1);

            profile.save()
                .then(profile => res.json(profile))
                .catch(err=>console.log(err));
        })
        .catch(err=>console.log(err));
})

module.exports = router;