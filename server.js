const express = require("express")
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
})

const players = {};
const AFK_TIMEOUT = 10000 // 5 minutes in milliseconds

// Run a check every 10 seconds to see who is inactive
// server.js
setInterval(() => {
    const now = Date.now();
    
    for (const id in players) {
        const timeInactive = now - players[id].lastSeen;

        if (timeInactive > AFK_TIMEOUT) {
            const socketToKick = io.sockets.sockets.get(id);

            if (socketToKick) {
                console.log(`Kicking ${id} for AFK`);
                
                // 1. Send the message FIRST
                socketToKick.emit('kickReason', 'You were AFK for too long!');
                
                // 2. Disconnect them after a tiny delay (200ms) 
                // This gives the "kickReason" packet time to travel to the client
                setTimeout(() => {
                    socketToKick.disconnect(true);
                }, 200);
            }
            delete players[id];
        }
    }
}, 5000); // Check every 5 seconds

io.on('connection', (socket) => {
    console.log('A player joined:', socket.id);

    //Create a new entry for this player
    players[socket.id] = {
        lastSeen: Date.now(),
        position: { x: 3, y: 0, z: 3 },
        rotation: { y: 0 },
        isCrouching: false
    };

    //Tell the new player about existing players
    socket.emit('currentPlayers', players);

    //Tell everyone else a new player has joined
    socket.broadcast.emit('newPlayer', { id: socket.id, data: players[socket.id] });

    // 4. Handle movement updates
    socket.on('playerMovement', (movementData) => {
        if (players[socket.id]) {
            players[socket.id].position = movementData.position;
            players[socket.id].rotation = movementData.rotation;
            players[socket.id].isCrouching = movementData.isCrouching;
            players[socket.id].lastSeen = Date.now()
            
            // Broadcast to everyone else
            socket.broadcast.emit('playerMoved', { id: socket.id, data: players[socket.id] });
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

http.listen(3000, () => console.log('Server running on port 3000'));

//Run Server - node server.js
//Run Clients - npx vite