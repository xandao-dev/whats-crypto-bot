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
		getCoin(coinId)
			.then((data) => sendResponse(data))
			.catch();
		return true;
	}
});

async function getCoin(coinId) {
	try {
		const simplePrice = await (
			await fetch(
				`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`
			)
		).json();
		const coinMarket = await (
			await fetch(
				`https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&ids=${coinId}&order=market_cap_desc&per_page=100&page=1&sparkline=false`
			)
		).json();

		const coinInfo = await (
			await fetch(
				`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false&sparkline=false`
			)
		).json();

		const data = {
			id: coinMarket[0].id,
			name: coinMarket[0].name,
			symbol: coinMarket[0].symbol,
			usd: simplePrice[coinId].usd,
			brl: coinMarket[0].current_price,
			marketCap: coinMarket[0].market_cap,
			high_24h: coinMarket[0].high_24h,
			low_24h: coinMarket[0].low_24h,
			price_change_percentage_24h: coinMarket[0].price_change_percentage_24h,
			homepage: coinInfo.links.homepage[0],
			sentiment_up: coinInfo.sentiment_votes_up_percentage,
			sentiment_down: coinInfo.sentiment_votes_down_percentage,
		};
		return data;
	} catch (e) {
		console.log('Error getting coin. ', e);
	}
}
