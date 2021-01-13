const mongoose = require('mongoose')
const validator = require('validator')

const mongoDBURL = process.env.MONGODB_URL

mongoose.connect(mongoDBURL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
