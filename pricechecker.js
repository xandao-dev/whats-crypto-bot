const togglePriceCheckerEl = document.getElementById('togglePriceChecker');

//on init update the UI checkbox based on storage
chrome.storage.sync.get('priceCheckerEnabled', function (data) {
	togglePriceCheckerEl.checked = data.priceCheckerEnabled;
});

togglePriceCheckerEl.onchange = function (element) {
	let value = this.checked;

	//update the extension storage value
	chrome.storage.sync.set({ priceCheckerEnabled: value }, function () {
		console.log('Price checker status: ' + value);
	});

	//Pass init or remove message to content script
	if (value) {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { command: 'init', priceCheckerEnabled: value }, function (response) {
				console.log(response.result);
			});
		});
	} else {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, { command: 'remove', priceCheckerEnabled: value }, function (response) {
				console.log(response.result);
			});
		});
	}
};
