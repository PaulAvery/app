import merge from 'merge';
import EventEmitter from '@paulavery/events';
import Logger from '@paulavery/logger';
import config from '@paulavery/config';

/* Symbol definitions for private properties */
let loggerKey = Symbol('app.js Logger Key');
let emitterKey = Symbol('app.js Emitter Key');
let optionsKey = Symbol('app.js Options Key');
let componentsKey = Symbol('app.js Component Key');

/* The default options of any app  */
let defaultOptions = {
	shutdownTimeout: 5000
};

export default class App {
	constructor(name, options = {}) {
		this.name = name;
		this.env = config(name, {env: 'local'}).env;

		/* Merge in new options */
		this[optionsKey] = merge.recursive(true, defaultOptions, options);

		/* Initiate config, logger and eventemitter */
		this[loggerKey] = new Logger({ debug: this.env !== 'production' });
		this[emitterKey] = new EventEmitter();

		/* Save all components to this array */
		this[componentsKey] = [];

		/* Log a trace message for every single event */
		this[emitterKey].on('*', (path, ...args) => {
			this[loggerKey].child('app:event').trace(`Emitted '${path.join(':')}'`, { path: path, data: args });
		});

		/* Immediately exit upon fatal error */
		this[emitterKey].on('app:fatal', error => {
			/* We cannot be sure anything (even the logger) works, so dump this directly to stderr */
			console.error('Exiting. Uncaught fatal error: ', error);

			/* And die */
			process.exit();
		});

		/* Fail if any eventhandler fails */
		this[emitterKey].catch(error => this[emitterKey].emit('app:fatal', error));
	}

	/**
	 * Register an application component (a simple function)
	 */
	register(component) {
		if(component.name === '') {
			throw new Error('Component has to have a name');
		}

		if(this[emitterKey][component.name]) {
			throw new Error(`Component cannot have name ${component.name} because it is reserved`);
		}

		if(this[componentsKey].length > 0 && (this[componentsKey][0][component.name] || this[componentsKey][0].name === component.name)) {
			throw new Error(`A component with name ${component.name} is already registered`);
		}

		/* Create childemitter and childlogger */
		let emitter = this[emitterKey].child(component.name);
		emitter.env = this.env;
		emitter.name = component.name;
		emitter.logger = this[loggerKey].child(component.name);
		emitter.shutdown = () => this.shutdown();

		/* If anything is emitted in the app namespace redirect it to the toplevel */
		emitter.on('app:*', (path, ...args) => this[emitterKey].emit('app:' + path.join(':'), ...args));

		/* Redirect all listeners to the root emitter */
		emitter.on = (...args) => this[emitterKey].on(...args);

		/* Merge the environmental configuration in */
		config(this.name, {[component.name]: component.config || {}});

		/* Create the component instance */
		this[loggerKey].child('app:component').trace(`Registering component "${component.name}"`, { config: component.config });
		let instance = component(emitter, component.config);

		/* Attach to each already existing component */
		this[componentsKey].forEach(comp => { comp[component.name] = instance; });

		/* Save, so we can later attach other components */
		this[componentsKey].push(emitter);

		/* Return ourselves for chaining */
		return this;
	}

	/**
	 * Start the application
	 */
	boot() {
		/* Set an interval to keep the process alive */
		setInterval(() => {}, Math.POSITIVE_INFINITY);

		/* Also attach signal handlers to shutdown this process */
		if(this[optionsKey].signals !== false) {
			process.on('SIGTERM', () => this.shutdown());
			process.on('SIGINT', () => this.shutdown());
		}

		/* Emit the boot event which all plugins should listen for if needed */
		return this[emitterKey].emit('app:boot');
	}

	/**
	 * Stop the application
	 */
	shutdown() {
		/* Try to shutdown all plugins. Hard-terminate after the set timeout */
		Promise.race([
			this[emitterKey].emit('app:shutdown'),
			new Promise(res => setTimeout(res, this[optionsKey].shutdownTimeout))
		])
		.then(() => process.exit());
	}
}
