import express from 'express'
import * as UserController from '../controllers/userController.js'

const Router = express.Router()

// Register a User
Router.post('/register',  UserController.Register_User)

// Login a User
Router.post('/login', UserController.Login_User)

// Check if the User is logged in
Router.post('/checkuser', UserController.verifyJWT, UserController.Check_User)

// Log the user out
Router.post('/logout', UserController.verifyJWT, UserController.Logout_User)

// Follow a User
Router.post('/followuser', UserController.verifyJWT, UserController.followUser)

// Unfollow a User
Router.post('/unfollowuser', UserController.verifyJWT, UserController.unfollowUser)

// Update the user
Router.put('/updateuser', UserController.verifyJWT, UserController.updateUser)

// Update the user profile pic
Router.put('/updateProfilePic', UserController.verifyJWT, UserController.updateProfilePic)

// Add a post to registred posts
Router.put('/addtoregistredposts', UserController.verifyJWT, UserController.registredPosts)

// Remove a post from registred posts
Router.put('/removefromregistredposts', UserController.verifyJWT, UserController.removeRegistredPost)

// See a notification
Router.put('/seeNoti', UserController.verifyJWT, UserController.seeNotification)

// See all the notifications
Router.put('/seeAllNoti', UserController.verifyJWT, UserController.seeAllNotifications)

// Delete all notifications
Router.delete('/deleteNotis', UserController.verifyJWT, UserController.deleteAllNotifications)

// Get the feed
Router.post('/getTheFeed', UserController.verifyJWT, UserController.getTheFeed)

// Delete a user
Router.delete('/deleteUser', UserController.verifyJWT, UserController.deleteUser)

export default Router