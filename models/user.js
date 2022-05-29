const mongoose = require('mongoose')
const Schema = mongoose.Schema
const passportLocalMoongoose = require('passport-local-mongoose')

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200')
})

const opts = { toJSON: { virtuals: true } }



const userSchema = new Schema({
    email: {
        type: String,
        require: true,
        unique: true
    },
    images: [ImageSchema],
    groups: [{
        type: Schema.Types.ObjectId,
        ref: 'Group'
    }]
}, opts)

userSchema.plugin(passportLocalMoongoose)

module.exports = mongoose.model('User', userSchema)