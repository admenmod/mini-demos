import { Vector2 } from 'ver/Vector2';


const defineReadonly = (o: object, p: string | symbol, value: unknown) => Object.defineProperty(o, p, {
	value, writable: false, enumerable: false, configurable: false
});

export const Ref = Symbol('trait.ref');
export const Payload = Symbol('trait.payload');

export interface Struct<T> {
	readonly [Ref]: symbol;
	readonly [Payload]: T;
}
export interface Trait<T> {
	readonly [Ref]: symbol;
	readonly name: string;
	(payload: T): Struct<T>;
}

export const trait = <T = void>(name: string): Trait<T> => {
	const ref = Symbol(`trait<${name}>`);

	const define = (payload: T) => {
		return Object.freeze({
			[Ref]: ref,
			[Payload]: payload
		});
	};

	defineReadonly(define, Ref, ref);
	defineReadonly(define, 'name', name);

	return define as Trait<T>;
};


const Entity = trait('Entity');
const Name = trait<string>('Name');
const Pos = trait<Vector2>('Pos');

const pos = Pos(new Vector2());
