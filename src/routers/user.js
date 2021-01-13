const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

const User = require('./../models/user')
const auth = require('./../middleware/auth')
const { sendWelcomeEmail, sendCancelationEmail } = require('./../email/account')

const router = express.Router()

// Create user
router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateToken()
        res.status(201).send({user, token})
    } catch(e) {
        res.status(400).send(e)
    }
})

// Login user
router.post('/users/login', async (req, res) => {
    try {
        const user =  await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

// Logout
router.get('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save()
        res.send()
    } catch (e) {
        res.sendStatus(500)
    }
})

// Logout from all devices
router.get('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.sendStatus(500)
    }
})

// Get user profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// Update user
router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'email', 'password']
    const isValidOperation = updates.every(ob => allowedUpdates.includes(ob))
    
    if (!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates!'})
    }

    try {

        // const user = await User.findById(req.params.id)
        const user = req.user
        updates.forEach(key => user[key] = req.body[key])
        await user.save()
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        
        // if (!user) {
        //     return res.sendStatus(404)
        // }

        res.send(user)
    } catch(e) {
        res.status(400).send(e)
    }
})

// Delete user
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Upload an avatar
const upload = multer({
    // dest: 'avatars',
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error('Please upload an image only'))
        }

        cb(undefined, true)
    }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

// Delete an avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    if (req.user.avatar) {
        req.user.avatar = undefined
        await req.user.save()
    }
    res.send()
})

// Get an avatar
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!(user && user.avatar)) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.sendStatus(404)
    }
})

module.exports = router;