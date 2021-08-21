const priceCommands = {
	'/price': {
		id: 'plant-vs-undead-token',
		icon: '🍀',
		name: 'PVU',
	},
	'/pvu': {
		id: 'plant-vs-undead-token',
		icon: '🍀',
		name: 'PVU',
	},
	'/slp': {
		id: 'smooth-love-potion',
		icon: '🩸',
		name: 'SLP',
	},
	'/axs': {
		id: 'axie-infinity',
		icon: '🪓',
		name: 'AXS',
	},
	'/dnxc': {
		id: 'dinox',
		icon: '🦖',
		name: 'DNXC',
	},
	'/pkmon': {
		id: 'polkamonster',
		icon: '🐲',
		name: 'PKMON',
	},
	'/dpet': {
		id: 'my-defi-pet',
		icon: '🐶',
		name: 'DPET',
	},
	'/cyt': {
		id: 'coinary-token',
		icon: '🐉',
		name: 'CYT',
	},
	'/skill': {
		id: 'cryptoblades',
		icon: '⚔️',
		name: 'SKILL',
	},
};

const selectors = {
	messages: '#main span.selectable-text.copyable-text',
	messageArea: '#main > footer div.selectable-text[contenteditable]',
	sendMessageButton: '#main > footer > div.copyable-area > div > div > div > button',
};
let botActive;

const sendMessage = function (message) {
	window.InputEvent = window.Event || window.InputEvent;

	var event = new InputEvent('input', {
		bubbles: true,
	});

	const textArea = document.querySelector(selectors.messageArea);

	textArea.textContent = message;
	textArea.dispatchEvent(event);

	document.querySelector(selectors.sendMessageButton).click();
};

const getLastMessage = function () {
	const messages = document.querySelectorAll(selectors.messages);
	return messages[messages.length - 1].textContent;
};

const publishCoinPrice = function (coinId) {
	chrome.runtime.sendMessage(
		{
			contentScriptQuery: 'getCoin',
			coinId: coinId,
		},
		function (res) {
			if (res) {
				console.log(res);
				const priceBrl = res[res.coinId].brl.toLocaleString('pt-br', {
					minimumFractionDigits: 2,
				});
				const priceUsd = res[res.coinId].usd.toLocaleString('pt-br', {
					minimumFractionDigits: 2,
				});
				const var24hBrl = Math.round(res[res.coinId].brl_24h_change * 100) / 100;
				const marketCapBrl = res[res.coinId].brl_market_cap.toLocaleString('pt-br', {
					minimumFractionDigits: 2,
				});

				const currentCoinKey = Object.keys(priceCommands).find((key) => priceCommands[key].id === res.coinId);
				const icon = priceCommands[currentCoinKey].icon;
				const name = priceCommands[currentCoinKey].name;
				sendMessage(
					`${icon} *${name} Bot* ${icon}\nO preço do ${name} é de *R$${priceBrl}* ($${priceUsd})\nA variação em 24h é de ${var24hBrl}%\nA Cap. de Mercado é de R$${marketCapBrl}`
				);
			} else {
				sendMessage(`Bot Indisponível 😢`);
			}
		}
	);
};

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

/*----------------------------------------------------------*/

const enablePriceChecker = async function () {
	console.log('PRICE CHECK ACTIVE');
	botActive = true;
	while (botActive) {
		const lastMessage = getLastMessage();
		if (priceCommands.hasOwnProperty(lastMessage)) {
			publishCoinPrice(priceCommands[lastMessage].id);
			await timer(2500);
		}
		if (lastMessage === '@null') {
			sendMessage('O cara é bom!');
			await timer(2500);
		}
		await timer(500);
	}
};

const disablePriceChecker = function () {
	botActive = false;
};

const addListeners = function () {
	enablePriceChecker();
};

const removeListeners = function () {
	disablePriceChecker();
};

//message listener for background
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.command === 'init') {
		addListeners();
	} else {
		removeListeners();
	}
	sendResponse({ result: 'success' });
});

//on init perform based on chrome storage value
window.onload = function () {
	chrome.storage.sync.get('priceCheckerEnabled', function (data) {
		if (data.priceCheckerEnabled) {
			addListeners();
		} else {
			removeListeners();
		}
	});
};
