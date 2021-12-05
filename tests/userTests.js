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
    return response.body._id
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
