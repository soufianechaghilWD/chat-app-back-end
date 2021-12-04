import mongoose from 'mongoose'

const schema = mongoose.Schema

const UserSchema = new schema({
    username: String,
    email: String,
    password: String,
    bio: String,
    posts: [{type: schema.Types.ObjectId, ref: 'Post'}],
    registedPosts: [{type: schema.Types.ObjectId, ref: 'Post'}],
    followers: [{type: schema.Types.ObjectId, ref: "User"}],
    profile_pic: {type: String, default: "default_url_pic.png"},
    notifications: [{type: schema.Types.ObjectId, ref: 'Notification'}]
})

export default mongoose.model('User', UserSchema)