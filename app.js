require('dotenv').config()

const path = require('path')
const express = require('express');
const app = express()
const ejsMate = require('ejs-mate')
const server = require('http').Server(app)
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid')
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server, { debug: true })
const mongoose = require('mongoose')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportLocalMoongoose = require('passport-local-mongoose')
const { cloudinary } = require('./cloudinary/index')
const { storage } = require('./cloudinary/index')
const flash = require('connect-flash')
const session = require('express-session')
const bodyParser = require('body-parser')
const User = require('./models/user')
const userRoutes = require('./routes/user');
const groupRoutes = require('./routes/group')
const { isLoggedIn } = require('./middleware');

mongoose.connect(process.env.DB_URL)
    .then(res => {
        console.log('Database connected')
    }).catch(e => console.log(e))

app.engine('ejs', ejsMate)
app.set('views engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

app.use('/peerjs', peerServer)

const sessionConfig = {
    secret: "thissholdbettersecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        hhtpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))
app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})



app.use('/', userRoutes)
app.use('/', groupRoutes)

app.get('/', (req, res) => {
    res.render('home.ejs')
})

app.get('/middleware', (req, res) => {
    id = uuidv4()
    res.redirect(`/${id}`)
})

app.get('/joinroom', isLoggedIn, (req, res) => {
    res.render('joinRoom.ejs')
})

app.post('/joinroom', isLoggedIn, (req, res) => {
    res.redirect(`/${req.body.id}`)
})


app.get('/:id', isLoggedIn, (req, res) => {
    if (req.params.id.length != uuidv4().length) {
        req.flash('error', 'Invalid Room ID')
        res.redirect('/')
    } else { res.render('room.ejs', { roomId: req.params.id }) }

})

io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)

        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message)
        })
    })
})


server.listen(process.env.PORT || 3030)