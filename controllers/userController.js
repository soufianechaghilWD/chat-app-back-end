import bcrypt from 'bcrypt'
import User from '../models/user.js'
import jwt, { decode } from 'jsonwebtoken'
import blacklist_JWT from '../models/blacklist_JWT.js'
import * as postController from './postController.js'
import multer from 'multer'
import Post from '../models/post.js'

// Register a User 
export const Register_User = async (req, res, next) => {
    try{
        var crypted_password = await bcrypt.hash(req.body.password, 10)
    }catch(e){
        res.status(500).json(e)
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
            profile_pic: 'default_url_pic.png'
        })
        try{
            var existed_user = await User.findOne({'username': req.body.username})
            // Check if the user already exists 
            if(existed_user === null){
                try{
                    var result = await new_user.save()
                    if(result) res.status(200).json(result) 
                    else res.status(500).json({msg: 'Could register the user'})
                }catch(e){
                    res.status(500).json({msg: 'Could register the user'})
                }
            }else{
                res.status(201).json({msg: "Username Already exists"})
            }
        }catch (err) {
            res.status(500).json(err)
        }
    }else res.status(400).json({"err": "Could not crypt the pass"})
}

// Login a User
export const Login_User = async (req, res, next) => {
    try{
        try{
            var user = await User.findOne({'username': req.body.username})
        }catch(e){
            res.status(500).json(e)
        }
        if(user){
            if(bcrypt.compare(req.body.password, user.password)){
                // Assign JWT and send back to user
                const token = jwt.sign({username: req.body.username}, "JwtSecret", {expiresIn: "7d"})
                res.status(200).json(token)
            }else res.status(202).json({msg: 'Wrong password and username combination'})
        }else res.status(300).json({msg: "User doesn't exist"})
    }catch(e){
        res.status(400).json(e)
    }
}

// Verify the User
export const Check_User = async (req, res, next) => {
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
export const Logout_User = async (req, res, next) => {
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
export const followUser = async (req, res, next) => {
    var to_follow = req.body.to_follow
    var me = req.body.me

    try{
        var user_to_follow = await User.findOne({_id: to_follow})
        var user_me = await User.findOne({_id: me})

        if(user_to_follow && user_me){
            var add_to_followers = await User.updateOne({_id: me}, {$push: {followers: to_follow}})
            if(add_to_followers) {
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
export const unfollowUser = async (req, res, next) => {
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
export const updateUser = async (req, res, next) => {
    
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
export const updateProfilePic = async (req, res, next) => {

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
export const registredPosts = async (req, res, next) => {
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
export const removeRegistredPost = async (req, res, next) => {
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
