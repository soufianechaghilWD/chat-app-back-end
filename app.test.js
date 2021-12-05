// import request from 'supertest'
// import app from "./server.js"
import mongoose from 'mongoose'
import * as UserTest from './tests/userTests.js'

beforeAll(done => {
  done()
})

afterAll(done => {
  // Closing the DB connection allows Jest to exit successfully.
  mongoose.connection.close()
  done()
})
var first_user = null 
var first_user_info = {
    username: '3wina',
    email: '3wina@gmail.com',
    password: '3wina',
    bio: 'This is a bio from user with username 3wina'
}
var first_user_token = null
var second_user = null 
var second_user_info = {
    username: 'chaarir',
    email: 'chaarir@gmail.com',
    password: 'chaarir',
    bio: 'This is a bio from user with username chaarir'
}
var second_user_token = null


describe('Auth API', () => {
    it('Should create new user (username: 3wina)', async () => {
      first_user = await UserTest.registerTest(first_user_info)
    })
    it('Should not create a user because it already exists', async () => {
      await UserTest.userAlreadyExists(first_user_info)
    })
    it('Should create a new user(username: chaarir)', async () => {
      second_user = await UserTest.registerTest(second_user_info)
    })
    it('Should not log in the user because the password is wrong', async () => {
      await UserTest.loginUserWrongPass({username: '3wina', password: 'wrong'})
    })
    it('Should not log in the user because the user does not exist', async () => {
      await UserTest.loginUserDoesNotExist({username: "33wina", password: 'doesnotexist'})
    })
    it('Should log in the user (username: 3wina)', async () => {
      first_user_token = await UserTest.loginUser({username: "3wina", password: "3wina"})
    })
})


