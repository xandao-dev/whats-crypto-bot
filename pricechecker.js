const togglePriceCheckerEl = document.getElementById('togglePriceChecker');
const togglePriceGraphEl = document.getElementById('togglePriceGraph');

//on init update the UI checkbox based on storage
chrome.storage.sync.get('priceCheckerEnabled', function (data) {
	togglePriceCheckerEl.checked = data.priceCheckerEnabled;
});

chrome.storage.sync.get('priceGraphEnabled', function (data) {
	togglePriceGraphEl.checked = data.priceGraphEnabled;
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
			chrome.tabs.sendMessage(
				tabs[0].id,
				{ command: 'init-price-checker', priceCheckerEnabled: value },
				function (response) {
					console.log(response.result);
				}
			);
		});
	} else {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(
				tabs[0].id,
				{ command: 'remove-price-checker', priceCheckerEnabled: value },
				function (response) {
					console.log(response.result);
				}
			);
		});
	}
};

togglePriceGraphEl.onchange = function (element) {
	let value = this.checked;

	//update the extension storage value
	chrome.storage.sync.set({ priceGraphEnabled: value }, function () {
		console.log('Price graph status: ' + value);
	});

	//Pass init or remove message to content script
	if (value) {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(
				tabs[0].id,
				{ command: 'init-price-graph', priceGraphEnabled: value },
				function (response) {
					console.log(response.result);
				}
			);
		});
	} else {
		chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
			chrome.tabs.sendMessage(
				tabs[0].id,
				{ command: 'remove-price-graph', priceGraphEnabled: value },
				function (response) {
					console.log(response.result);
				}
			);
		});
	}
};
