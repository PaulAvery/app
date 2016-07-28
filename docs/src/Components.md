# Components
This application expects you to structure your application into separated components.

For this module, a component is simply a function with a return value and a name. You can register it via `app.register()`. It will be called after `app.boot()` is called and before `app:boot` is emitted.

As its first argument the component will be passed an object. For each component there will be a promise attached to this object. This promise will be fulfilled with the return value of that component's function.

The object will also emit an `app:boot` event once all components are loaded and an `app:shutdown` event once the app is exiting.

## Example
```js
async function component1(app) {
	/* Will log  'And I am no. 2' before app:boot */
	console.log(await app.component2);

	return 'I am component1';
}

function component2(app) {
	/* Will log  'I am component1' after app:boot */
	app.on('app:boot', async () => console.log(await app.component1));

	return 'And I am no. 2';
}

new App('my-app').register(component1).register(component2).boot();
```
