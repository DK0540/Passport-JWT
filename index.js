const express = require('express');
const app = express();
const cors = require('cors');
const { hashSync, compareSync } = require('bcrypt');
const UserModel = require('./config/database');
const jwt = require('jsonwebtoken');
var passport = require('passport')
require('./config/passport')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize());
app.use(cors());



app.post('/register', (req, res) => {
    const user = new UserModel({
        username: req.body.username,
        password: hashSync(req.body.password, 10)
    })

    user.save().then(user => {
        res.send({
            success: true,
            message: "User created successfully.",
         
        })
    }).catch(err => {
        res.send({
            success: false,
            message: "Something went wrong",
            error: err
        })
    })
})

app.post('/login', (req, res) => {
    UserModel.findOne({ username: req.body.username }).then(user => {
        //No user found
        if (!user) {
            return res.status(401).send({
                success: false,
                message: "Could not find the user."
            })
        }

        //Incorrect password
        if (!compareSync(req.body.password, user.password)) {
            return res.status(401).send({
                success: false,
                message: "Incorrect password"
            })
        }

        const payload = {
            username: user.username,
            id: user._id
        }
        console.log(payload)

        const token = jwt.sign(payload, "Random string", { expiresIn: "1d" })

        return res.status(200).send({
            success: true,
            message: "Logged in successfully!",
            token: "Bearer " + token
        })
    })
})


app.get('/protected', passport.authenticate('jwt', { session: false }), (req, res,next) => {
    return res.status(200).json({
        success:true, message:"you are utheraised",
        user: {
            id: req.user._id,
            username: req.user.username,
        }
    });
})

app.listen(7000, () => console.log("Listening to port 7000"));