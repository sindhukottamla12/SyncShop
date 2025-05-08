const express = require('express');
const {User} = require('../db');
const {Product} = require('../db');
const jwt = require("jsonwebtoken")
const JWT_SECRET = require("../config")
const zod = require('zod');
const router = express.Router();

const signUpSchema = zod.object({
    username: zod.string(),
    password: zod.string(),
    fullName: zod.string()
})

router.post('/signup', async (req, res) => {
    const body = req.body;
    const success = signUpSchema.safeParse(body);
    if (!success) {
        return res.status(400).json({
            Message : "Incorrect inputs plase check your inputs",
         });
    }
    const user = await User.findOne({
        username : body.username
    })
    if(user){
        return res.json({
            message : "User Already Exists",
        })
    }
    const dbUser = await User.create(body)
    const userId = dbUser._id;
    await Product.create({
        userId: userId,
        products: [],
    })
    const token = jwt.sign({
        userId
    },JWT_SECRET)

    res.json({
        message:"user created successfully",
        token : token
    })
});

const signinBody = zod.object({
    username : zod.string(),
    password: zod.string()
})

router.post('/signin', async (req, res) => {
    const {success} = signinBody.safeParse(req.body);
    if(!success){
        return res.json({
            message : "Incorrect Inputs"
        })
    }

    const user = await User.findOne({
        username : req.body.username,
        password : req.body.password,
    })

    if(user){
        const token = jwt.sign({
            userId : user._id
        },JWT_SECRET)

        return res.json({
            token
        })
    }
    res.status(411).json({
        message: "Error while logging in"
    })
});

module.exports = router;