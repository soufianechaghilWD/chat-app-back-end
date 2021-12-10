import mongoose from 'mongoose'
import * as UserTest from './tests/userTests.js'
import * as PostTest from './tests/postTests.js'

beforeAll(done => {
  done()
})

afterAll(done => {
  // Closing the DB connection allows Jest to exit successfully.
  mongoose.connection.close()
  done()
})
var first_user = null 
var post = null
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


describe('\n\n\n\nUser route', () => {

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

    it('Should logs in the second user (username: chaarir)', async () => {
      second_user_token = await UserTest.loginUser({username: "chaarir", password: "chaarir"})
    })

    it('Should check if the second user is logged in', async () => {
      await UserTest.checkUserLogIn(second_user_token)
    })

    it('Should user(3wina) follow user(chaarir)', async () => {
      first_user = await UserTest.followUser(first_user._id, second_user._id, first_user_token)
    })

    it('Should put all the notifications to seen for user(chaarir)', async () => {
      await UserTest.seeNotis(second_user._id, second_user_token)
    })

    it('Should update the bio of the user (3wina)', async () => {
      first_user = await UserTest.updateUser(first_user._id, first_user_token)
    })

    it('Should update the users profile pic (chaarir)', async () => {
      second_user = await UserTest.updateProfilePic(second_user._id, second_user_token)
    })

})

describe('\n\n\n\nPost route', () => {

  it('Should create a post', async () => {
    post = await PostTest.addPost(second_user._id, second_user_token)
  })

  it('Should like the post by the publisher (chaarir)', async () => {
    post = await PostTest.likePost(post._id, second_user._id, second_user_token)
  })

  it('Should comment on the post by the publisher (chaarir)', async () => {
    post = await PostTest.commentPost(post._id, second_user._id, second_user_token)
  })

  it('Should return the feed for the first user (3wina)', async () => {
    await PostTest.getTheFeed(first_user._id, first_user_token)
  })
  
})


describe('\n\n\n\nDelete the data after tests are done', () => {

  it('Sould delete all the notifications of the first user(3wina)', async () => {
    await PostTest.deleteNotifications(first_user._id, first_user_token)
  })

  it('Sould delete all the notifications of the second user(chaarir)', async () => {
    await PostTest.deleteNotifications(second_user._id, second_user_token)
  })

  it('Should delete the post ', async () => {
    await PostTest.deletePost(post._id, second_user._id, second_user_token)
    post = null
  })

  it('Should delete the user (username: 3wina)', async () => {
    await UserTest.deleteUser(first_user._id, first_user_token)
    first_user_token = null
    first_user = null
  })

  it('Should delete the user (username: chaarir)', async () => {
    await UserTest.deleteUser(second_user._id, second_user_token)
    second_user_token = null
    second_user = null
  })

})


