import mongoose from 'mongoose'

const schema = mongoose.Schema

const postSchema = schema({
    publisher: {type: schema.Types.ObjectId, ref: 'User'},
    caption: String,
    picUrl: String,
    likers: [{type: schema.Types.ObjectId, ref: 'User'}],
    comments: [{type: schema.Types.ObjectId, ref: 'Comment'}],
    created: Date
})

export default mongoose.model('Post', postSchema)