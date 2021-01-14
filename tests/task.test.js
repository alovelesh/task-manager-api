const request = require('supertest')
const app = require('./../src/app')

const { taskThree, userOne, setUpDatabase} = require('./fixtures/db')

const Task = require('./../src/models/task')

beforeEach(setUpDatabase)

test('should create task for user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({"description": "   buy fruits   "})
        .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.description).toBe('buy fruits')
})

test('should get all the task of user', async () => {
    const res = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(res.body.length).toBe(2)
})

test('should not delete task by other user', async () => {
    await request(app)
        .delete('/tasks/' + taskThree._id)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404)
    
    const task  = await Task.findById(taskThree._id)
    expect(task).not.toBeNull()
})

test('should fetch only completed tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .query({completed: true})
        .send()
        .expect(200)
    
    expect(response.body.length).toBe(1)
})