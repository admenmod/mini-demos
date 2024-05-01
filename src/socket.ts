import { Fn } from 'ver/helpers';
import { codeShell } from 'ver/codeShell';
import { atom } from 'nanostores';
import { Event, EventDispatcher, FunctionIsEvent } from 'ver/events';
import { type Socket, io } from 'socket.io-client';
export { io } from 'socket.io-client';


export interface ServerToClientEvents {
	run: (namespace: string, code: string, args_string: string, args: any[], async: boolean, generator: boolean) => unknown;
}
export interface ClientToServerEvents {
	run: (namespace: string, code: string, args_string: string, args: any[], async: boolean, generator: boolean) => unknown;
}

export type socket = Socket<ServerToClientEvents, ClientToServerEvents>;
export let socket!: socket;

export const $connected = atom(false);
$connected.listen(value => {
	if(!value) throw new Error('socket is connected');

	$connect.await();
});

export const DEFAULT_SOCKET_ADDRESS = `${location.protocol}//${location.hostname}:5000`;

export const $connect: FunctionIsEvent<null, [], (address?: string) => Promise<socket>> =
new FunctionIsEvent(null, (address = DEFAULT_SOCKET_ADDRESS) => new Promise((res, rej) => {
	if($connected.get()) return rej(new Error('socket is connected'));

	socket = io(address);

	socket.on('connect', () => {
		res(socket);
		$connected.set(true);
	});
}));


const mock_socket = new class extends EventDispatcher {
	public '@run' = new Event<this, [...Parameters<ServerToClientEvents['run']>]>(this);
}


export const ENV: Record<string, {
	env: object;
	api?: any;
	source?: string;
}> = {};


export const addenv = (name: string, env: object, api: any = env, source?: string) => {
	return ENV[name] = { env, api, source: source || name };
};

export const execute = (
	namespace: string,
	code: string,
	args_string: string = '',
	args: any[] = [],
	async: boolean = false,
	generator: boolean = false
) => (socket || mock_socket).emit('run', namespace, code, args_string, args, async, generator);

export const buildTask = <N extends string, F extends Fn>(namespace: N, fn: F) => {
	const { arguments: args_string, code, async, generator } = Fn(fn);

	return (...args: Fn.A<F>) => {
		execute(namespace, code, args_string, args, async, generator);
	};
};


$connect.on(() => new Promise<void>(res => {
	socket.on('run', (namespace, code, args_string, args, async, generator) => {
		if(!ENV[namespace]) throw new Error('space error');

		const space = ENV[namespace];

		codeShell<(...args: any[]) => Promise<unknown>>(code, space.env, {
			async, generator,
			arguments: args_string,
			insulate: false,
			source: `socket code [${space.source}]`
		}).apply(space.api, args).then(() => res());
	});
}));

mock_socket.on('run', (namespace, code, args_string, args, async, generator) => {
	if(!ENV[namespace]) throw new Error('space error');

	const space = ENV[namespace];

	codeShell<(...args: any[]) => Promise<unknown>>(code, space.env, {
		async, generator,
		arguments: args_string,
		insulate: false,
		source: `socket code [${space.source}]`
	}).apply(space.api, args);
});
