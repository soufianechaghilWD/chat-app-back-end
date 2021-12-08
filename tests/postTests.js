import request from 'supertest'
import app from '../server.js'

// Test for posting a post 
export async function addPost (publisher, token) {

    var response = await request(app).post('/addpost')
                        .field('publisher', publisher)
                        .field('token', token)
                        .field('caption', 'This is a test caption')
                        .attach('file', __dirname+'/a.jpg')
                        .set('x-access-token', token)
    expect(response.status).toBe(200)
    return response.body
}

// Like a post
export async function likePost (post, liker, token) {
    var response = await request(app).post('/likepost').send({
        post_id: post,
        user_id: liker,
        token: token
    })
    expect(response.status).toBe(200)
    return response.body
}

// Comment a post
export async function commentPost(post, commenter, token) {
    var response = await request(app).post('/commentpost').send({
        post_id: post,
        user_id: commenter,
        comment: "Comment test on the post",
        token: token
    })
    expect(response.status).toBe(200)
    return response.body
}

// Delete a post
export async function deletePost(post, deleter, token){
    var response = await request(app).delete('/deletepost').send({
        post_id: post,
        user_id: deleter
    })
    .set('x-access-token', token)
    expect(response.status).toBe(200)
}

// Delete all notifications
export async function deleteNotifications(user){
    var response = await request(app).delete('/deleteNotis').send({
        user_id: user
    })
    expect(response.status).toBe(200)
}