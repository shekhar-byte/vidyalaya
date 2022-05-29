const videoGrid = document.getElementById('video-grid')

const myVideo = document.createElement('video')
myVideo.muted = true

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
})

const socket = io('/');

let myVideoStream;


navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream
    addVideoStream(myVideo, stream)

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', (userId) => {
        // connectToNewUser() gets triggered before the user has finished the navigator promise
        setTimeout(connecToNewUser, 1000, userId, stream)
    })

    let text = $('input')

    $('html').keydown((e) => {
        if (e.which == 13 && text.val().length !== 0) {
            console.log(text.val());
            socket.emit('message', text.val())
            text.val('')
        }
    })

    socket.on('createMessage', message => {
        $('.messages').append(`<li class="message"><b>User</b>:  ${message}</li>`)
        scrollToBottom()
    })

})



peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})


const connecToNewUser = (userId, stream) => {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}


const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

const scrollToBottom = () => {
    let d = $('.main_chat_window')
    d.scrollTop(d.prop("scrollHeight"))
}

//mute our video
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false
        setUnmutedButton()
    } else {
        setMuteButton()
        myVideoStream.getAudioTracks()[0].enabled = true
    }
}

const setMuteButton = () => {
    const html = `
  <i class="fa-solid fa-microphone"></i>
  <span>Mute</span>`
    document.querySelector('.main_mute_button').innerHTML = html
}

const setUnmutedButton = () => {
    const html = `
  <i class="unmute fa-solid fa-microphone-slash"></i>
  <span>Unmute</span>`
    document.querySelector('.main_mute_button').innerHTML = html
}

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true
    }
}

const setStopVideo = () => {
    const html = `
  <i class="fa-solid fa-video"></i>
  <sapn>Stop Video</span>`
    document.querySelector('.main_video_button').innerHTML = html
}

const setPlayVideo = () => {
    const html = `
  <i class="stop fa-solid fa-video-slash"></i>
  <span>Play Video</span>`

    document.querySelector('.main_video_button').innerHTML = html
}

// // const webCamElement = document.getElementById('webCam')
// // const canvasElement = document.getElementById('canvas')
// // const webcam = new Webcam(webCamElement,"user",canvasElement)
// // webcam.stream()