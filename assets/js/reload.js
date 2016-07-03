(function liveReload() {
	var date = Date.now();

	function checkUpdate() {
		fetch('change')
			.then(function(response) {
				if(!response.ok) {
					throw new Error('Request failed: [' + response.status + ']' + response.statusText);
				}

				return response.text();
			}).then(function(text) {
				if(parseInt(text) > date) {
					window.location.reload();
				}
			}).catch(function(e) {
				console.error(e);
			}).then(function() {
				/* Try again (also after error, because we might get a 404 if we fetch during rebuild) */
				window.setTimeout(checkUpdate, 1000);
			});
	}

	/* Only start checking if we are running locally */
	if(['localhost', '127.0.0.1'].indexOf(window.location.hostname) !== -1) {
		checkUpdate();
	}
})()
