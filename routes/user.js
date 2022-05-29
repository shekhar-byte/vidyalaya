const express = require('express')
const passport = require('passport')
const router = express.Router()
const catchAsync = require('../utilites/catchAsync')
const { isLoggedIn } = require('../middleware')
const multer = require('multer')
const { storage } = require('../cloudinary')
const user = require('../models/user')
const upload = multer({ storage })

router.route('/register')
    .get((req, res) => {
        res.render('registerForm.ejs')
    })
    .post(upload.array('image'), async(req, res) => {
        try {
            const { email, username, password } = req.body
            const images = req.files.map(f => ({ url: f.path, filename: f.filename }))
            const newUser = new user({ email, username, images })
            const registeredUser = await user.register(newUser, password)
            req.flash('success', 'Successfully registered ')
            res.redirect(`/`)
        } catch (e) {
            req.flash('error', e.message)
            res.redirect('/register')
        }
    })

router.route('/login')
    .get((req, res) => {
        res.render('loginForm.ejs')
    })
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }),
        (req, res) => {
            req.flash('success', `Welcome back`)
            res.redirect('/')
        })


router.route('/logout')
    .get((req, res, next) => {
        req.logout(function(err) {
            if (err) { return next(err); }
            res.redirect('/');
        })
    })

module.exports = router