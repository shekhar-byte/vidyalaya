const video = document.getElementById('video')
const canvas = document.getElementById('canvas')
const errMsg = document.getElementById('spanErrorMsg')
let img = document.getElementById('imgUser')
let loggedImg = document.getElementById('imgLoggedUser')
const constraints = {
    video: { width: 1280, height: 720 }
}

async function init() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        handleSucess(stream)
    } catch (e) {
        console.log(e);
    }
}

function handleSucess(stream) {
    window.stream = stream;
    video.srcObject = stream;
}

init();

let imageUrl = null;
let destCanvas = document.getElementById('canvas2')
var destctx = destCanvas.getContext('2d')
var context = canvas.getContext('2d')
let imageUpload = document.getElementById('canvas')

const draw = async() => {
    imageUpload = await context.drawImage(video, 0, 0, 200, 180)
    destctx.drawImage(canvas, 0, 0)
    imageUrl = destCanvas.toDataURL()
    img.src = imageUrl

}
setInterval(draw, 15000)


// using TenserFlow Models
setInterval(() => {
    Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    ]).then(async() => {
        console.log("model loaded", imageUrl)
        fetch(imageUrl)
            .then(function(res) {
                return res.blob()
            })
            .then(async function(blob) {
                const image = await faceapi.bufferToImage(blob)
                const detection = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
                console.log(detection.length)
                if (detection.length === 0) {
                    window.alert("No is present on screen")
                } else if (detection.length > 1) {
                    window.alert("More than one people is present on the screen")
                }
            })

    })
}, 30000)


// let loadingModule = async() => {
//     await faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
//         await faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
//         await faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
//     console.log('moduleLoaded')
// }
// loadingModule().then(start)

// function start() {
//     imageUpload.addEventListener('change', async() => {
//         const image = await faceapi.bufferToImage(imageUpload)
//         const detection = await faceapi.detectAllfaces(image).withFaceLandmarks().withFaceDescriptors()
//         console.log("detection.length")
//     })
// }

let start = async() => {
    const image = await faceapi.bufferToImage(imageUpload)
    const detection = await faceapi.detectAllfaces(image).withFaceLandmarks().withFaceDescriptors()
    console.log(detection.length)
}