const { randomUUID } = require('crypto');
const express = require('express');
const app = express();

const server = require('http').Server(app);
const io = require('socket.io')(server);


app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.redirect(`/${randomUUID()}`)
});

app.get("/:room", (req, res) => {

    res.render("room", { roomId: req.params.room });

})

io.on('connection', socket => {

    //event when user join room
    socket.on('join-room', (roomId, userId) => {
        console.log(roomId, userId);
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
    })

    socket.on("callCreated", (offer) => {

        //console.log(offer, "offer");
    })

    socket.on("offerUpdated", (roomId, offer) => {
        console.log(offer, "offer");
        
        socket.to(roomId).emit('updateOffer', offer);
    })

    socket.on("joining", (roomId, answer) => {
        console.log(answer, "answer");
        socket.to(roomId).emit('answered', answer);

    })
})



server.listen(3000);

