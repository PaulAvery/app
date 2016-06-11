# Event Handling
The `app` object which is passed to each component is an instance of [@paulavery/events](https://pages.github.io/paulavery/events).
Therefore you can use it to pass messages between components.

All components share the same root emitter, which means they can listen to each others events:

```js
function component1(app) {
	app.on('component2:event', data => { /* Do something */ });
}

function component2(app) {
	app.emit('event', data);
}

new App('app').register(component1).register(component2).boot();
```

As you can see above, if you emit an event, it is emitted into a scope named after your component. Therefore a component can listen to all scopes, but emit only to its own.
