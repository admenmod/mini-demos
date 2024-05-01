import os from 'node:os';
import { Server } from 'socket.io';


const PORT = 5000;
const HOST = (() => {
	const nets = os.networkInterfaces();

	for(const id in nets) {
		for(const net of nets[id]) {
			if(net.netmask === '255.255.255.0' && net.family === 'IPv4' && !net.internal) return net.address;
		}
	}

	return 'localhost';
})();

const io = new Server();

const sockets = [];


io.on('connection', socket => {
	console.log(sockets.map(({ id }) => ({ id })));

	socket.on('run', (...args) => io.emit('run', ...args));

	socket.on('disconnecting', reason => {
		const l = sockets.indexOf(socket);
		if(!~l) return;
		sockets.splice(l, 1);

		console.log(`disconnect (${reason})`, socket.id, sockets.map(({ id }) => id));
	});

	sockets.push(socket);

	console.log('connection', sockets.map(({ id }) => id));
});


io.listen(PORT, {
	hostname: HOST,
	cors: { origin: '*' }
});

console.log(`${HOST}:${PORT} Starting...`);
