import mongoose from 'mongoose'

const schema = mongoose.Schema

const commentSchema = schema({
    publisher: {type: schema.Types.ObjectId, ref: 'User'},
    created: Date,
    text: String,
    post: {type: schema.Types.ObjectId, ref: 'Post'}
})

export default mongoose.model('Comment', commentSchema)