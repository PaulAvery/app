# Configuration
The application is configured entirely through environment variables. To make things (especially in development) a little bit easier, the [dotenv](https://npmjs.org/package/dotenv) module is used.

Therefore you can dump a `.env` file into your applications root directory and define your environment variables there.

The application will only parse environment variables prefixed with the (all-caps) name of the app. The only variable interpreted by the application instance itself is `YOURAPP_ENV`. Its value will be made available as `app.env` and defaults to `local`.

## Component configuration
Because your application will be made up of nothing but components, the only way configuration data will be made available is directly to each component.

You will have to define your default configuration on your component like so:

```js
export default function sampleComponent(app, config) {
	/* Some code here */
}

sampleComponent.config = {
	'port': 80,
	'basepath': '/tmp'
}
```

If you now set the `YOURAPP_SAMPLECOMPONENT_PORT` variable to `8080`, the config object passed to your component will look like this:

```json
{
	"port": 8080,
	"basepath": "/tmp"
}
```
