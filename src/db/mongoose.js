const mongoose = require('mongoose')
const validator = require('validator')

const mongoDBURL = process.env.MONGODB_URL
const databaseName = 'task-manager-api'
const collectionName = 'users'

mongoose.connect(mongoDBURL + databaseName, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})
