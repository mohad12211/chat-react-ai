const express = require("express")
require('@tensorflow/tfjs-node');
const toxicity = require('@tensorflow-models/toxicity');
const app = express()
const cors = require("cors")
const http = require('http').Server(app);
const PORT = 4000
const url = process.env.NODE_ENV === 'production' ? "https://typological.me" : "http://localhost:3000"
const socketIO = require('socket.io')(http, {
    cors: {
        origin: url
    }
});
const fs = require('fs');
const rawData = fs.readFileSync('messages.json');
const messagesData = JSON.parse(rawData);

app.use(cors())
app.use(express.static('build'))
let users = []
let model = null;
toxicity.load(0.6).then(m => {
    model = m;
    console.log("Toxicity Model Loaded");
});


socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`)

    socket.on("message", async (data) => {
        let predictions = (await model.classify(data.text)).filter(p => p.results[0].match).map(p => ({ label: p.label, match: p.results[0].match }));
        let classifiedData = { ...data, predictions };
        messagesData["messages"].push(classifiedData)
        const stringData = JSON.stringify(messagesData, null, 2)
        fs.writeFile("messages.json", stringData, (err) => {
            if (err) {
                console.error(err);
            }
        })
        socketIO.emit("messageResponse", classifiedData)
    })

    socket.on("typing", data => {
        socket.broadcast.emit("typingResponse", data)
        setTimeout(() => socket.broadcast.emit("typingResponse", ""), 3000)
    })

    socket.on("newUser", data => {
        users.push(data)
        socketIO.emit("newUserResponse", users)
    })

    socket.on('disconnect', () => {
        console.log('🔥: A user disconnected');
        users = users.filter(user => user.socketID !== socket.id)
        socketIO.emit("newUserResponse", users)
        socket.disconnect()
    });
});

app.get('/api', (req, res) => {
    res.json(messagesData);
});


http.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
