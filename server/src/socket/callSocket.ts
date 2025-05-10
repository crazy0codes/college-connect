let waitingClients = Queue;

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.inCall = false;
    socket.disconnected = false;

    socket.on('start-call', () => {
        if (waitingClients.size() < 1) {
            waitingClients.push(socket);
            socket.emit('waiting');
        } else {
            const pair = waitingClients.pairClients();
            if (!pair) {
                waitingClients.push(socket);
                socket.emit('waiting');
                return;
            }

            const { offer, answer } = pair;

            offer.otherPeer = answer;
            answer.otherPeer = offer;

            offer.emit('ready-to-call', { type: 'offer' });
            answer.emit('ready-to-call', { type: 'answer' });
        }
    });

    socket.on('ice-candidate', (candidate) => {
        if (socket.otherPeer) {
            socket.otherPeer.emit('ice-candidate', candidate);
        }
    });

    socket.on('offer', (offer) => {
        if (socket.otherPeer) {
            socket.otherPeer.emit('offer', offer);
        }
    });

    socket.on('answer', (answer) => {
        if (socket.otherPeer) {
            socket.otherPeer.emit('answer', answer);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        socket.disconnected = true;

        if (socket.otherPeer) {
            const peer = socket.otherPeer;

            peer.emit('call-ended');
            peer.otherPeer = null;
            peer.inCall = false;

            // ✅ Requeue the peer if still connected
            if (!peer.disconnected) {
                waitingClients.push(peer);
            }
        }

        socket.otherPeer = null;
        socket.inCall = false;

        waitingClients.removeClient(socket);
    });
});
