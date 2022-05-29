const express = require('express')
const router = express.Router()
const Group = require('../models/group')
const User = require('../models/user')
const { isLoggedIn } = require('../middleware');
const { json } = require('body-parser');
const { v4: uuidv4 } = require('uuid')

router.route('/group')
    .get(isLoggedIn, (req, res) => {
        res.render('group/createGroupForm.ejs')
    })
    .post(isLoggedIn, async(req, res) => {
        try {
            const newGroup = new Group(req.body)
            newGroup.author = req.user.username
            newGroup.roomid = uuidv4()
            await newGroup.save()
            req.flash('success', 'Group created successfully')
            res.redirect('/')
        } catch (e) {
            req.flash('error', e.message)
            res.redirect('/')
        }

    })

router.route('/group/all')
    .get(async(req, res) => {
        const groups = await Group.find({})
        res.render('group/showAllGroups.ejs', { groups })
    })

router.route('/group/:id')
    .get(isLoggedIn, async(req, res) => {
        const group = await Group.findById(req.params.id)
        const members = group.members
        res.render('group/showGroup.ejs', { group })
    })
    .post(isLoggedIn, async(req, res) => {
        try {
            const username = req.body
            const currentGroup = await Group.findById(req.params.id)
            const requiredUser = await User.findOne(username)
            if (requiredUser === null) {
                req.flash('error', 'Not valid Username')
                res.redirect('/group/all')
            } else {
                currentGroup.members.push(JSON.stringify(requiredUser))
                await currentGroup.save()
                req.flash('success', "user added")
                res.redirect(`/group/${req.params.id}`)

            }
        } catch (e) { req.flash('error', e.message) }

    })

module.exports = router