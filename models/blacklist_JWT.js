import mongoose from 'mongoose'

const Schema = mongoose.Schema

const blacklist__JWTSchema = Schema({
    token: String
})

export default mongoose.model("blacklist__JWT", blacklist__JWTSchema)