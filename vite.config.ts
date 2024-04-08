import os from 'node:os';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import preact from '@preact/preset-vite'


const port = 3000;
const host = (() => {
	const nets = os.networkInterfaces();

	for(const id in nets) {
		for(const net of nets[id]!) {
			if(net.netmask === '255.255.255.0' && net.family === 'IPv4' && !net.internal) return net.address;
		}
	}

	return 'localhost';
})();


export default defineConfig({
	plugins: [tsconfigPaths(), preact()],
	server: {
		host, port
	}
});
