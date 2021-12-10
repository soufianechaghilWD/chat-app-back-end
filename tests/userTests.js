import request from 'supertest'
import app from '../server.js'

// Create new User
export async function registerTest (user_info) {
    var response = await request(app).post('/register').send(user_info)
    expect(response.body).toEqual(expect.objectContaining({
        username: user_info.username,
        email: user_info.email,
        bio: user_info.bio,
        posts: [],
        registedPosts: [],
        followers: [],
        profile_pic: "default_url_pic.png",
        notifications: []
    }))
    expect(typeof(response.body.password)).toBe('string')
    expect(response.status).toBe(200)
    return response.body
}

// Return can not create new user because it already exists
export async function userAlreadyExists (user_info) {
    var response = await request(app).post('/register').send(user_info)
    expect(response.status).toBe(401)
    expect(response.body.msg).toBe('Username Already exists')
}

// Can not log in the user because wrong password
export async function loginUserWrongPass (user_info) {
    var response = await request(app).post('/login').send(user_info)
    expect(response.status).toBe(202)
    expect(response.body.msg).toBe('Wrong password')

}

// Can not log in the user because user does not exist
export async function loginUserDoesNotExist (user_info) {
    var response = await request(app).post('/login').send(user_info)
    expect(response.status).toBe(300)
    expect(response.body.msg).toBe("User doesn't exist")

}

// Logs in the User and returns the token
export async function loginUser (user_info) {
    var response = await request(app).post('/login').send(user_info)
    expect(response.status).toBe(200)
    return response.body
}

// Check if the user is logged in
export async function checkUserLogIn (token) {
    var response = await request(app).post('/checkuser').send({"token": token})
    expect(response.status).toBe(200)
    expect(response.body.msg).toBe('You are logged in')
}

// Delete a user
export async function deleteUser (user_id, token) {
    var response = await request(app).delete('/deleteUser').send({user_id: user_id, token: token})
    expect(response.status).toBe(200)
    expect(response.body.msg).toBe('User deleted')
}

// Follow a user
export async function followUser (me, to_follow, token) {
    var response = await request(app).post('/followuser').send({
        to_follow: to_follow,
        me: me,
        token: token
    })
    expect(response.status).toBe(200)
    return response.body
}

// See all the notifications
export async function seeNotis (user, token) {
    var response = await request(app).put('/seeAllNoti').send({user_id: user, token: token})
    expect(response.status).toBe(200)
}

// Update the user's bio
export async function updateUser(user, token) {
    var response = await request(app).put('/updateuser').send({user_id: user, bio: 'Updated bio u guys', token: token})
    expect(response.status).toBe(200)
    return response.body
}

// Update the user's profile picture
export async function updateProfilePic(user, token) {
    var response = await request(app).put('/updateProfilePic').attach('file', __dirname+'/a.jpg').field('user_id', user).set('x-access-token', token)
    // console.log(response.body)
    expect(response.status).toBe(200)
    return response.body
}