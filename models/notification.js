import mongoose from 'mongoose'

const schema = mongoose.Schema

var notificationSchema = schema({
    follow: {type: schema.Types.ObjectId, ref: 'User', default: null},
    like: {
        post: {type: schema.Types.ObjectId, ref: 'Post', default: null},
        user: {type: schema.Types.ObjectId, ref: 'User', default: null}
    },
    comment: {
        post: {type: schema.Types.ObjectId, ref: 'Post', default: null},
        user: {type: schema.Types.ObjectId, ref: 'User', default: null}
    },
    seen: {type: Boolean, default: false},
    user: {type: schema.Types.ObjectId, ref: 'User', default: null}
})

export default mongoose.model('Notification', notificationSchema)