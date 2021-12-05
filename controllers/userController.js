import bcrypt from 'bcrypt'
import User from '../models/user.js'
import jwt, { decode } from 'jsonwebtoken'
import blacklist_JWT from '../models/blacklist_JWT.js'
import * as postController from './postController.js'
import multer from 'multer'
import Post from '../models/post.js'
import Notification from '../models/notification.js'

// Register a User 
export async function Register_User (req, res, next) {
    try{
        var crypted_password = await bcrypt.hash(req.body.password, 10)
    }catch(e){
        return res.status(501).json(e)
    }
    if(crypted_password){
        var new_user = new User({
            username: req.body.username,
            email: req.body.email,
            password: crypted_password,
            bio: req.body.bio,
            posts: [],
            registedPosts: [],
            followers: [],
            notifications: []
        })
        try{
            var existed_user = await User.findOne({'username': req.body.username})
            // Check if the user already exists 
            if(existed_user === null){
                try{
                    var result = await new_user.save()
                    if(result) return res.status(200).json(result) 
                    else return res.status(401).json({msg: 'Could not register the user'})
                }catch(e){
                    return res.status(401).json({msg: 'Could not register the user'})
                }
            }else{
                return res.status(401).json({msg: "Username Already exists"})
            }
        }catch (err) {
            return res.status(500).json(err)
        }
    }else return res.status(401).json({"err": "Could not crypt the pass"})
}

// Login a User
export async function Login_User (req, res, next) {
    try{
        try{
            var user = await User.findOne({'username': req.body.username})
        }catch(e){
            return res.status(500).json(e)
        }
        if(user){
            if(await bcrypt.compare(req.body.password, user.password)){
                // Assign JWT and send back to user
                const token = jwt.sign({username: req.body.username}, "JwtSecret", {expiresIn: "7d"})
                return res.status(200).json(token)
            }else return res.status(202).json({msg: 'Wrong password'})
        }else return res.status(300).json({msg: "User doesn't exist"})
    }catch(e){
        return res.status(400).json(e)
    }
}

// Verify the User
export async function Check_User (req, res, next) {
    var token = req.body.token
    try{
        try{
            var found = await blacklist_JWT.findOne({'token': token})
        }catch(e){
            res.status(500).json(e)
        }
        if(found) res.status(400).json({msg: 'You need to login again'})
        else res.status(200).json({msg: 'You are logged in'})
    }catch(e){
        res.status(501).json(e)
    }
}

// Log the User out
export async function Logout_User (req, res, next) {
    var token = req.body.token
    var new_Blacklist_jwt = new blacklist_JWT({
        'token': token
    })
    try{
        try{
            var added_blacklist_jwt = await new_Blacklist_jwt.save()
        }catch(e){
            res.status(501).json(e)
        }
        if(added_blacklist_jwt) res.status(200).json({msg: 'been logged out'})
        res.status(401).json({msg: 'Could not log out'})
    }catch(e) {
        res.status(500).json(e)
    }
}

// Follow a user
export async function followUser (req, res, next) {
    var to_follow = req.body.to_follow
    var me = req.body.me

    try{
        var user_to_follow = await User.findOne({_id: to_follow})
        var user_me = await User.findOne({_id: me})

        if(user_to_follow && user_me){
            var add_to_followers = await User.updateOne({_id: me}, {$push: {followers: to_follow}})
            var noti = new Notification({
                follow: me,
                user: to_follow
            })
            var saved_noti = await noti.save()
            var add_to_notification = await User.updateOne({_id: to_follow}, {$push: {notifications: saved_noti._id}})
            if(add_to_followers && add_to_notification) {
                try{
                    var updated_user = await User.findOne({_id: me})
                    res.status(200).json(updated_user)
                }catch(e){
                    res.status(500).json(e)
                }
            }else{
                res.status(401).json({msg: "Could not follow the user"})
            }
        }else res.status(401).json({msg: "One of the users doesn't exist"})
    }catch(e){
        res.status(500).json(e)
    }
}

// Unfollow a user
export async function unfollowUser (req, res, next) {
    var to_follow = req.body.to_follow
    var me = req.body.me

    try{
        var user_to_follow = await User.findOne({_id: to_follow})
        var user_me = await User.findOne({_id: me})

        if(user_to_follow && user_me){
            var remove_from_followers = await User.updateOne({_id: me}, {$pull: {followers: to_follow}})
            if(remove_from_followers) {
                try{
                    var updated_user = await User.findOne({_id: me})
                    res.status(200).json(updated_user)
                }catch(e){
                    res.status(500).json(e)
                }
            }else{
                res.status(401).json({msg: "Could not unfollow the user"})
            }
        }else res.status(401).json({msg: "One of the users doesn't exist"})
    }catch(e){
        res.status(500).json(e)
    }
}

// Update the user
export async function updateUser (req, res, next) {
    
    var user_id = req.body.user_id
    if(user_id){
        try{
            var user = await User.findOne({_id: user_id})
            if(req.body.bio){
                user.bio = req.body.bio
                try{
                    var new_user = await user.save()
                    if(new_user) res.status(200).json(user)
                    else res.status(401).json({msg: 'Could not update the user'})
                }catch(e){ res.status(500).json(e) }
            }else if (req.body.username){
                try{
                    var new_username = await User.findOne({username: req.body.username})
                    if(new_username) res.status(401).json({msg: "User already exists"})
                    else{
                        user.username = req.body.username
                        try{
                            var new_user = await user.save()
                            if(new_user) res.status(200).json(user)
                            else res.status(401).json({msg: 'Could not update the user'})
                        }catch(e) { res.status(500).json(e) }
                    }
                }catch(e){ res.status(500).json(e) }
            }else if(req.body.password){
                try{
                    var newpass = await bcrypt.hash(req.body.password, 10)
                    if(newpass){
                        user.password = newpass
                        try{    
                            var new_user = await user.save()
                            if(new_user) res.status(200).json(user)
                            else res.status(401).json({msg: 'Could not update the user'}) 
                        }catch(e) { res.status(500).json(e) }
                    }else req.status(401).json({msg: "Could not get the hashed value"})
                }catch(e) { res.status(500).json(e) }
            }else res.status(401).json({msg: 'Do not what to update'})
        }catch(e){ res.status(500).json(e) }    
    }else res.status(401).json({msg: 'User not found'})
}

// Update the profile picture
export async function updateProfilePic (req, res, next) {

    postController.upload(req, res, async(err) => {
        if(err instanceof multer.MulterError){
            res.status(401).json({msg: 'A multer error has occured'})
        }else if (err){
            res.status(402).json(err)
        }
        try{
            var user = await User.findOne({_id: req.body.user_id})
            if(user){
                if(user.profile_pic !== 'default_url_pic.png'){
                    postController.delete_Pic(user.profile_pic)   
                }
                user.profile_pic = req.file.filename
                try{
                    var new_user = await user.save()
                    if(new_user) res.status(200).json(user)
                    else res.status(401).json({msg: 'Could not update the user'})
                }catch(e){ res.status(500).json(e) }
            }else res.status(401).json({msg: 'User not found'})
        }catch(e){ res.status(500).json(e) }
    })

}

// Add a post to registred posts
export async function registredPosts (req, res, next) {
    try{
        var post = await Post.findOne({_id: req.body.post_id})
        var user = await User.findOne({_id: req.body.user_id})
        if(post && user){
            user.registedPosts.push(req.body.post_id)
            try{
                var new_user = await user.save()
                if(new_user) res.status(200).json(user)
                else res.status(401).json({msg: 'Could not update the user'})
            }catch(e) { res.status(500).json(e) }
        }else res.status(401).json({msg: "Post or User does not exist"})
    }catch(e) { res.status(500).json(e) }
}

// Remove a post from registred posts
export async function removeRegistredPost (req, res, next) {
    try{
        var post = await Post.findOne({_id: req.body.post_id})
        var user = await User.findOne({_id: req.body.user_id})
        if(post && user){
            try{
                var new_user = await User.updateOne({_id: req.body.user_id}, {$pull: {registedPosts: req.body.post_id}})
                if(new_user){
                    try{
                        var up_user = await User.findOne({_id: req.body.user_id})
                        if(up_user) res.status(200).json(up_user)
                        else res.status(401).json({msg: "Could not get the updated user"})
                    }catch(e) { res.status(500).json(e) }
                }else res.status(401).json({msg: "Could not add the post"})
            }catch(e) { res.status(500).json(e) }
        }else res.status(401).json({msg: "Post or User does not exist"})
        
    }catch(e) { res.status(500).json(e) }
}

// See a notification
export async function seeNotification (req, res, next) {
    var noti_id = req.body.noti_id
    var user_id = req.body.user_id

    try{
        var notification = await Notification.findOne({_id: noti_id})

        if(notification){
            if(String(JSON.stringify(notification.user)).replace(/\"/g, "") == user_id){
                notification.seen = true
                var updated_not = await notification.save()
                var user = await User.findOne({_id: user_id})
                if(user && updated_not) res.status(200).json(user)
                else res.status(401).json({msg: 'Could not get the updated user'})
            }else res.status(401).json({msg: "Can't see a not that not yours"})
        }else res.status(401).json({msg: "User or Notification unfound"})

    }catch(e) { res.status(500).json(e) }
}

// See all notifications
export async function seeAllNotifications (req, res, next) {
    var user_id = req.body.user_id

    try{
        var updated_Not = await Notification.updateMany({user: user_id, seen: false}, {seen: true})
        if(updated_Not){
            var user = await User.findOne({_id: user_id})
            if(user) res.status(200).json(user)
            else res.status(401).json({msg: 'Could not get the updated user'})
        }else res.status(401).json({msg: 'Could not see all notifications'})
    }catch(e) { res.status(500).json(e) }
}

// Delete all notifications
export async function deleteAllNotifications (req, res, next) {
    var user_id = req.body.user_id

    try{
        var user = await User.findOne({_id: user_id})
        var deletedNoti = await Notification.deleteMany({user: user_id})

        if(user && deletedNoti){
            user.notifications = []
            var saved_user = await user.save()
            if(saved_user) res.status(200).json(saved_user)
            else res.status(401).json({msg: 'Could not get the updated user'})
        }else res.status(401).json({msg: 'Could not find the user or could not delete notification'})
    }catch(e) { res.status(500).json(e) }
}

// Get the feed
export async function getTheFeed (req, res, next) {

    var user_id = req.body.user_id
    try{    
        var posts = await Post.find({})
        var user = await User.findOne({_id: user_id})
        if(user && posts){
            var user_folls = user.followers.map(ele => JSON.stringify(ele))
            var returned_posts = posts.filter(post => user_folls.includes(JSON.stringify(post.publisher)) === true)
            res.status(200).json(returned_posts)
        }else res.status(401).json({msg: 'Could not get post or user'})
    }catch(e) { res.status(500).json(e) }
}

// Verify the Token
export const verifyJWT = (req, res, next) => {
    const token = req.body.token || req.params.token ||req.headers['x-access-token']
    if(!token) res.status(403).json({msg: "You need a token"})
    else{
        jwt.verify(token, 'JwtSecret', (err, decoded) => {
            if(err) res.status(403).json({msg: "you failed to authenticate"})
            else{
                res.userId = decode.id
                next()
            }
        })
    }
}
