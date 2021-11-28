import Post from '../models/post.js'
import multer from 'multer'

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
            if(saved) res.status(200).json(saved)
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
        if(post){
            try{
                var new_post = await Post.updateOne({_id: post_id}, {$push: {likers: user_id}})
                if(new_post) {
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
        if(post){
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