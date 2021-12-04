import Post from '../models/post.js'
import multer from 'multer'
import User from '../models/user.js'
import Comment from '../models/comment.js'
import path from 'path'
import fs from 'fs'
import Notification from '../models/notification.js'

const __dirname = path.resolve()
// Add a picture to the server
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
export const upload = multer({storage}).single('file')


// Delete a file
export const delete_Pic = (url) => {
    var file_path = path.join(__dirname, '/public', url)
    fs.unlink(file_path, (err) => {
        if(err) return err
    })
    return true
}

//Add a post 
export const addPost =  (req, res, next) => {
    upload(req, res, async (err) => {
        if(err instanceof multer.MulterError){
            res.status(401).json({msg: 'A multer error has occured'})
        }else if (err){
            res.status(402).json(err)
        }
        try{
            var new_post = new Post({
                publisher: req.body.publisher,
                caption: req.body.caption,
                picUrl: req.file.filename,
                likers: [],
                comments: [],
                created: Date.now()
            })
            var saved = await new_post.save()
            if(saved) {
                var user = await User.updateOne({_id: req.body.publisher}, {$push: {posts: saved._id}})
                res.status(200).json(saved)
            }
            else res.status(400).json({msg: 'Could not save the post'})
        }catch(e){
            res.status(501).json(e)
        }
    })
}

// Like a post
export const likePost = async (req, res, next) => {
    var post_id = req.body.post_id
    var user_id = req.body.user_id
    
    try{
        var post = await Post.findOne({_id: post_id})
        var user = await User.findOne({_id: user_id})
        if(post && user){
            try{
                var new_post = await Post.updateOne({_id: post_id}, {$push: {likers: user_id}})
                if(post.publisher !== user._id){
                    var new_noti = new Notification({
                        like: {
                            post: post._id,
                            user: user._id
                        },
                        user: post.publisher
                    })
                    var saved_noti = await new_noti.save()
                    var updated_publisher = await User.updateOne({_id: post.publisher}, {$push: {notifications: saved_noti._id}})
                }
                if(new_post && updated_publisher) {
                    try{
                        var new_post1 = await Post.findOne({_id: post_id})
                        if(new_post1) res.status(200).json(new_post1)
                        else res.status(400).json({msg: 'Could not get the updated version'})
                    }catch(e){
                        res.status(501).json(e)
                    }
                }else res.status(400).json({msg: 'Could not like the post'})
            }catch(e){
                res.status(501).json(e)
            }
        }else res.status(400).json({msg: "Post Doesn't exist"})
    }catch(e){
        res.status(501).json(e)
    }
}

// Dislike a post
export const dislikePost = async (req, res, next) => {
    var post_id = req.body.post_id
    var user_id = req.body.user_id
    try{
        var post = await Post.findOne({_id: post_id})
        var user = await User.findOne({_id: user_id})
        if(post && user){
            var new_post = await Post.updateOne({_id: post_id}, {$pull: {likers: user_id}})
            if(new_post) {
                try{
                    var new_post1 = await Post.findOne({_id: post_id})
                    if(new_post1) res.status(200).json(new_post1)
                    else res.status(400).json({msg: 'Could not get the updated version'})
                }catch(e){
                    res.status(501).json(e)
                }
            }else res.status(400).json({msg: 'Could not dislike the post'})
        }else res.status(400).json({msg: "Post Doesn't exist"})

    }catch(e){
        res.status(501).json(e)
    }
}

// Delete a post
export const deletePost = async (req, res, next) => {
    var post_id = req.body.post_id
    var user_id = req.body.user_id

    try{
        var post = await Post.findOne({_id: post_id})
        var user = await User.findOne({_id: user_id})
        if(post && user){
            if(JSON.stringify(post.publisher) === JSON.stringify(user._id)){
                try{
                    var deleted_comments = await Comment.deleteMany({post: post_id})
                    delete_Pic(post.picUrl)                    
                    try{
                        var deleted_post = await Post.deleteOne({_id: post_id})
                        if(deleted_post) {
                            var updated_user = await User.updateOne({_id: user_id}, {$pull: {posts: post_id}})
                            if(updated_user)res.status(200).json(deleted_post)
                            else res.status(401).json({msg: 'Could not delete the post from the user posts list'})
                        }
                        else res.status(400).json({msg: "Could not delete the post"})
                    }catch(e){
                        res.status(501).json(e)
                    }
                }catch(e){
                    res.status(501).json(e)
                }
            }else res.status(400).json({msg: "You can not delete a post you did not created"})
        }else res.status(400).json({msg: "Post or User Doesn't exist"})
    }catch(e){
        res.status(501).json(e)
    }
}

// Comment on a post
export const addComment = async (req, res, next) => {
    var post_id = req.body.post_id
    var user_id = req.body.user_id
    var comment = req.body.comment

    try{
        var post = await Post.findOne({_id: post_id})
        var user = await User.findOne({_id: user_id})
        if(post && user){
            try{
                var new_comment = new Comment({
                    publisher: user_id,
                    created: Date.now(),
                    text: comment,
                    post: post_id
                })
                var added_comment = await new_comment.save()
                if(added_comment){
                    try{
                        var new_post = await Post.updateOne({_id: post_id}, {$push: {comments: added_comment._id}})
                        if(user_id !== post.publisher){
                            var new_not = new Notification({
                                comment: {
                                    post: post._id,
                                    user: user._id
                                },
                                user: post.publisher
                            })
                            var saved_not = await new_not.save()
                            var updated_publisher = await User.updateOne({_id: post.publisher}, {$push: {notifications: saved_not._id}})
                        }
                        if(new_post && updated_publisher){
                            try{
                                var new_post_v1 = await Post.findOne({_id: post_id})
                                if(new_post_v1) res.status(200).json(new_post_v1)
                                else res.status(400).json({msg: "Could not get the updated post"})
                            }catch(e){
                                res.status(501).json(e)
                            }
                        }else res.status(400).json({msg: "Could not add the comment to post"})
                    }catch(e){
                        res.status(501).json(e)
                    }
                }else res.status(400).json({msg: "Could not create the comment"})
            }catch(e){
                res.status(501).json(e)
            }
        }else res.status(400).json({msg: "Post or User Doesn't exist"})
    }catch(e){
        res.status(501).json(e)
    }
}

// Delete a comment 
export const deleteComment = async (req, res, next) => {
    var comment_id = req.body.comment_id
    var user_id = req.body.user_id
    var post_id = req.body.post_id

    try{
        var post = await Post.findOne({_id: post_id})
        var user = await User.findOne({_id: user_id})
        var comment = await Comment.findOne({_id: comment_id})
        if(post && user && comment){
            if(JSON.stringify(comment.publisher) === JSON.stringify(user._id)){
                try{
                    var delete_comment = await Comment.deleteOne({_id: comment_id})
                    if(deleteComment){
                        try{
                            var delete_comment_from_post = await Post.updateOne({_id: post_id}, {$pull: {comments: comment_id}})
                            if(delete_comment_from_post){
                                try{
                                    var returned_post = await Post.findOne({_id: post_id})
                                    if(returned_post) res.status(200).json(returned_post)
                                    else res.status(400).json({msg: 'Could not get the updated post'})
                                }catch(e){
                                    res.status(501).json(e)
                                }
                            }else res.status(400).json({msg: "Could not delete the comment from the post"})
                        }catch(e){
                            res.status(501).json(e)
                        }
                    }else res.status(400).json({msg: 'Could not delete the comment'})
                }catch(e){
                    res.status(501).json(e)
                }
            }else res.status(400).json({msg: "You can not delete a comment you did not add"})
        }else res.status(400).json({msg: "Post or User or Comment Doesn't exist"})
    }catch(e){
        res.status(501).json(e)
    }
}