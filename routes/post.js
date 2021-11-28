import express from 'express'
import *  as userController from '../controllers/userController.js'
import * as postController from '../controllers/postController.js'

// Create the router
const Router = express.Router()

// Add a post to DB
// Router.post('/addpost', userController.verifyJWT, postController.addPost)
Router.post('/addpost', postController.addPost)

// Like a post
// Router.post('/likepost', userController.verifyJWT, postController.likePost)
Router.post('/likepost', postController.likePost)

// Dislike a post
// Router.post('/dislikepost', userController.verifyJWT, postController.dislikePost)
Router.post('/dislikepost', postController.dislikePost)

// Delete a post
// Router.post('/deletepost', userController.verifyJWT, postController.deletePost)
Router.delete('/deletepost', postController.deletePost)

// Comment on a post
// Router.post('/commentpost', userController.verifyJWT, postController.addComment)
Router.post('/commentpost', postController.addComment)

// Delete a post
// Router.post('/deletecomment', userController.verifyJWT, postController.deleteComment)
Router.delete('/deletecomment', postController.deleteComment)

export default Router