# Logging
The `app` object passed to your components has a `logger` property attached to it. This is an instance of [@paulavery/logger](https://pages.github.io/paulavery/logger) scoped to your components name.
You may use this to log whatever you like:

```js
function component1(app) {
	app.logger.log('Hi, I got registered!');
}

new App().register(component1);
```

## Debug mode
If the environment is not set to `production`, the logger will print formatted and colorized output. Otherwise it will print JSON strings.
