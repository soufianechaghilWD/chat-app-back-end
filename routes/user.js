import express from 'express'
import * as UserController from '../controllers/userController.js'

const Router = express.Router()

// Register a User
Router.post('/register',  UserController.Register_User)

// Login a User
Router.post('/login', UserController.Login_User)

// Check if the User is logged in
Router.post('/checkUser', UserController.verifyJWT, UserController.Check_User)

// Log the user out
Router.post('/logout', UserController.verifyJWT, UserController.Logout_User)

export default Router