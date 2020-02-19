const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(http);

let clients = [];

app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

io.on('connection', (socket) => {
    if (clients.indexOf(socket) == -1) clients.push(socket);
    
    socket.on('disconnect', () => {
        clients.forEach((v, i) => {
            if (socket == v) clients.splice(i, 1);
        });
    });

    socket.on('message', (msg) => {
        io.emit('message', msg);
    });
});

http.listen(8080, () => {
    console.log('listening on localhost:8080');
});