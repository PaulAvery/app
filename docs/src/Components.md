# Components
This application expects you to structure your application into separated components.

For this module, a component is simply a function with a return value and a name. You can register it via `app.register()` and it will be called immediately.

As its first argument the component will be passed an object. This object will emit an `app:boot` event. The moment this happens, the return values of all other components will be available as properties on said object.

## Example
```js
function component1(app) {
	/* Will log  'And I am no. 2' */
	app.on('app:boot', () => console.log(app.component2));

	return 'I am component1';
}

function component2(app) {
	/* Will log  'I am component1' */
	app.on('app:boot', () => console.log(app.component1));

	return 'And I am no. 2';
}

new App('my-app').register(component1).register(component2).boot();
```
