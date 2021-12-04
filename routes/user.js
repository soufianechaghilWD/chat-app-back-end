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
// Router.post('/followuser', UserController.verifyJWT, UserController.followUser)
Router.post('/followuser', UserController.followUser)

// Unfollow a User
// Router.post('/unfollowuser', UserController.verifyJWT, UserController.unfollowUser)
Router.post('/unfollowuser', UserController.unfollowUser)

// Update the user
// Router.put('/updateuser', UserController.verifyJWT, UserController.updateUser)
Router.put('/updateuser', UserController.updateUser)

// Update the user profile pic
// Router.put('/updateProfilePic', UserController.verifyJWT, UserController.updateProfilePic)
Router.put('/updateProfilePic', UserController.updateProfilePic)

// Add a post to registred posts
// Router.put('/addtoregistredposts', UserController.verifyJWT, UserController.registredPosts)
Router.put('/addtoregistredposts', UserController.registredPosts)

// Remove a post from registred posts
// Router.put('/removefromregistredposts', UserController.verifyJWT, UserController.removeRegistredPost)
Router.put('/removefromregistredposts', UserController.removeRegistredPost)

// See a notification
// Router.put('/seeNoti', UserController.verifyJWT, UserController.seeNotification)
Router.put('/seeNoti', UserController.seeNotification)

// See all the notifications
// Router.put('/seeAllNoti', UserController.verifyJWT, UserController.seeAllNotifications)
Router.put('/seeAllNoti', UserController.seeAllNotifications)

// Delete all notifications
// Router.delete('/deleteNotis', UserController.verifyJWT, UserController.deleteAllNotifications)
Router.delete('/deleteNotis', UserController.deleteAllNotifications)

// Get the feed
// Router.post('/getTheFeed', UserController.verifyJWT, UserController.getTheFeed)
Router.post('/getTheFeed', UserController.getTheFeed)

export default Router