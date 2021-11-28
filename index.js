import express from 'express'
import cors from 'cors'
import * as Config from './config/config.js'
import mongoose from 'mongoose'
import userRouter from './routes/user.js'
import postRouter from './routes/post.js'
import path from 'path'

const __dirname = path.resolve()
const app = express()


// Connect to mongoose
mongoose.connect(Config.Db_Url)
mongoose.connection.on('connected', () => console.log("Database is connected"))
mongoose.connection.on('error', () => console.log("Database Having troubles"))
mongoose.connection.on('disconnected', () => console.log("Database is Disconnected"))



app.use(cors())
app.use(express.json())
app.use(userRouter)
app.use(postRouter)
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => res.send('Hello guys it is me'))

const port = process.env.PORT || 8000


app.listen(port, () => console.log('App running on http://localhost:'+port))