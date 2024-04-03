const express = require("express")
const multer = require('multer')
const fal = require("@fal-ai/serverless-client");
const storage = multer.diskStorage({
    destination: function(_, _, cb) {
        cb(null, './pfp/')
    },
    filename: function(_, file, cb) {
        cb(null, file.fieldname)
    }
})
const upload = multer({ storage: storage })

require('@tensorflow/tfjs-node');
let model = null;
const toxicity = require('@tensorflow-models/toxicity');
toxicity.load(0.6).then(m => {
    model = m;
    console.log("Toxicity Model Loaded");
});

const fs = require('fs');
const rawData = fs.readFileSync('messages.json');
const messagesData = JSON.parse(rawData);
let users = []

const PORT = 4000
const app = express()
const http = require('http').Server(app);
const cors = require("cors")
app.use(cors())
app.use(express.static('build'))
app.use(express.static('pfp'))

const url = process.env.NODE_ENV === 'production' ? "https://typological.me" : "http://localhost:3000"
const io = require('socket.io')(http, {
    cors: {
        origin: url
    }
});

io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`)

    socket.on("message", async (data) => {
        let predictions = (await model.classify(data.text)).filter(p => p.results[0].match).map(p => ({ label: p.label, match: p.results[0].match }));
        let classifiedData = { ...data, predictions, userId: socket.id };
        messagesData["messages"].push(classifiedData)
        const stringData = JSON.stringify(messagesData, null, 2)
        fs.writeFile("messages.json", stringData, (err) => {
            if (err) {
                console.error(err);
            }
        })
        io.emit("messageResponse", classifiedData)
    })

    socket.on("typing", data => {
        socket.broadcast.emit("typingResponse", data)
        setTimeout(() => socket.broadcast.emit("typingResponse", ""), 3000)
    })

    socket.on("newUser", data => {
        users.push(data)
        io.emit("newUserResponse", users)
    })

    socket.on('disconnect', () => {
        console.log('🔥: A user disconnected');
        users = users.filter(user => user.socketID !== socket.id)
        io.emit("newUserResponse", users)
        socket.disconnect()
    });
});

app.get('/api', (_, res) => {
    res.json(messagesData);
});

app.post('/profile', upload.any(), async (req, res) => {
    console.log(req.files);
    fal.config({
        credentials: "54f4efc6-3806-46d2-b40d-039a4b51fcb4:ed1a4e2863f987d29f611c98924087aa",
    });
    const result = await fal.subscribe("fal-ai/imageutils/nsfw", {
        input: {
            image_url: `${url}/${req.files[0].filename}`
            // image_url: `https://www.vikiswim.com/cdn/shop/files/VIKISWIM-DUA-BIKINI-BLACK-BROWNRINGS_2400x.jpg`
        },
        logs: true,
        onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
                update.logs.map((log) => log.message).forEach(console.log);
            }
        },
    });
    if (result.nsfw_probability > 0.2) {
        fs.unlink(req.files[0].path, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                return;
            }
        });
    }
    res.status(200).send();
});

http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
