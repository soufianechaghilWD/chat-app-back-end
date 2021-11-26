import mongoose from 'mongoose'

const schema = mongoose.Schema

const UserSchema = new schema({
    username: String,
    email: String,
    password: String,
    posts: [{type: schema.Types.ObjectId, ref: 'Post'}],
    registedPosts: [{type: schema.Types.ObjectId, ref: 'Post'}],
    people_that_follow_the_user: [{type: schema.Types.ObjectId, ref: 'User'}],
    people_that_the_user_follow: [{type: schema.Types.ObjectId, ref: "User"}]
})

export default mongoose.model('User', UserSchema)