import app from './server.js'


const port = process.env.PORT || 8000

app.listen(port, () => console.log('App running on http://localhost:'+port))
