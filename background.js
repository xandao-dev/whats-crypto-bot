// Extension event listeners are a little different from the patterns you may have seen in DOM or
// Node.js APIs. The below event listener registration can be broken in to 4 distinct parts:
//
// * chrome      - the global namespace for Chrome's extension APIs
// * runtime     – the namespace of the specific API we want to use
// * onInstalled - the event we want to subscribe to
// * addListener - what we want to do with this event
//
// See https://developer.chrome.com/docs/extensions/reference/events/ for additional details.
chrome.runtime.onInstalled.addListener(async () => {
	chrome.storage.sync.set({ priceCheckerEnabled: false }, function () {
		console.log('Price Checker installed!');
	});
});

chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
	chrome.declarativeContent.onPageChanged.addRules([
		{
			conditions: [
				new chrome.declarativeContent.PageStateMatcher({
					pageUrl: { hostEquals: 'https://web.whatsapp.com/' },
				}),
			],
			actions: [new chrome.declarativeContent.ShowPageAction()],
		},
	]);
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.contentScriptQuery == 'getCoin') {
		const coinId = request.coinId;
		fetch(
			`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd%2Cbrl&include_market_cap=true&include_24hr_change=true`
		)
			.then((response) => response.json())
			.then((data) => {
				data.coinId = coinId;
				sendResponse(data);
			})
			.catch();
		return true;
	}
});
