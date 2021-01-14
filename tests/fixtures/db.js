const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const User = require('./../../src/models/user')
const Task = require('./../../src/models/task')

const userOneId = new mongoose.Types.ObjectId()

const userOne = {
    _id: userOneId,
    name: 'test user',
    email: 'new@test.com',
    password: 'test@321!',
    age: 21,
    tokens: [{
        token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
    }]
}

const userTwoId = new mongoose.Types.ObjectId()

const userTwo = {
    _id: userTwoId,
    name: 'test 2',
    email: 'new2@test.com',
    password: 'test2@321!',
    age: 21,
    tokens: [{
        token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'test data to do',
    owner: userOne._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    completed: true,
    description: 'test data 2 to do',
    owner: userOne._id
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    completed: true,
    description: 'test data 2 to do',
    owner: userTwo._id
}

const setUpDatabase = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    userOne, userOneId,
    userTwo, userOneId,
    taskOne, taskTwo, taskThree,
    setUpDatabase
}