const express = require("express")
app.use(express.static("dist"))
const app = express()
const http = require("http").createServer(app)
const io = require("socket.io")(http, {
    cors: {
        origin: "http://0.0.0.0:5173",
        methods: ["GET", "POST"]
    }
})

const players = {};
const AFK_TIMEOUT = 5 * 60 * 1000 // 5 minutes in milliseconds

setInterval(() => {
    const now = Date.now();
    
    for (const id in players) {
        const timeInactive = now - players[id].lastSeen;

        if (timeInactive > AFK_TIMEOUT) {
            const socketToKick = io.sockets.sockets.get(id);

            if (socketToKick) {
                console.log(`Kicking ${id} for AFK`);

                socketToKick.emit('kickReason', 'You were AFK for too long!');
                
                // Disconnect them after a tiny delay (200ms) 
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
        position: { x: 10, y: 0.35, z: 10 }, // Y should be the radius of the capsule
        rotation: { y: 0 },
        isCrouching: false
    };

    //Tell the new player about existing players
    socket.emit('currentPlayers', players);

    //Tell everyone else a new player has joined
    socket.broadcast.emit('newPlayer', { id: socket.id, data: players[socket.id] });

    //Handle movement updates
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

const PORT = process.env.PORT || 3000

http.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`)
    });

//Run Server - node server.js
//Run Clients - npx vite