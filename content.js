const priceCommands = {
	'/pvu': {
		id: 'plant-vs-undead-token',
		icon: '🍀',
	},
	'/slp': {
		id: 'smooth-love-potion',
		icon: '🩸',
	},
	'/axs': {
		id: 'axie-infinity',
		icon: '🪓',
	},
	'/dnxc': {
		id: 'dinox',
		icon: '🦖',
	},
	'/pkmon': {
		id: 'polkamonster',
		icon: '🐲',
	},
	'/dpet': {
		id: 'my-defi-pet',
		icon: '🐶',
	},
	'/cyt': {
		id: 'coinary-token',
		icon: '🐉',
	},
	'/skill': {
		id: 'cryptoblades',
		icon: '⚔️',
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

				const priceBrl = res.brl.toLocaleString('pt-br', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 6,
				});
				const priceUsd = res.usd.toLocaleString('pt-br', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 6,
				});
				const max24h = res.high_24h.toLocaleString('pt-br', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				});
				const min24h = res.low_24h.toLocaleString('pt-br', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				});
				const var24hPercentage = Math.round(res.price_change_percentage_24h * 100) / 100;
				const marketCapBrl = res.marketCap.toLocaleString('pt-br', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				});

				const currentCoinKey = Object.keys(priceCommands).find((key) => priceCommands[key].id === res.id);
				const icon = priceCommands[currentCoinKey].icon;
				sendMessage(
					`${icon} *${res.name}* ${icon}
O preço do ${res.symbol} é de *R$${priceBrl}* ($${priceUsd})
Máximo 24h: R$${max24h}
Mínimo 24h: R$${min24h}
Variação 24h: ${var24hPercentage}%
Market Cap: R$${marketCapBrl}\n
Sentimento positivo: ${res.sentiment_up}%
Página do projeto: ${res.homepage}`
				);
			} else {
				sendMessage(`Bot Indisponível 😢`);
			}
		}
	);
};

const publishTrending = function () {
	chrome.runtime.sendMessage(
		{
			contentScriptQuery: 'getTrends',
		},
		function (res) {
			if (res) {
				console.log(res);

				let message = `📈 *Trends* 📈\n`;
				res.forEach((trend) => {
					message += `${trend.position}: ${trend.name} (${trend.symbol})\n`;
				});
				sendMessage(message);
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
			await timer(3000);
		}
		if (lastMessage === '/trend' || lastMessage === '/trends' || lastMessage === '/trending') {
			publishTrending();
			await timer(3000);
		}
		if (lastMessage === '/list' || lastMessage === '/commands') {
			const commands = Object.keys(priceCommands);
			let message = `📈 *Comandos* 📈\n`;
			message += `/commands ou /list\n`;
			message += `/trends\n`;
			commands.forEach((command) => {
				message += `${command}\n`;
			});
			message += `@null`;
			sendMessage(message);
			await timer(3000);
		}
		if (lastMessage.includes('@null')) {
			sendMessage('O cara é bom!');
			await timer(3000);
		}
		await timer(500);
	}
};

const disablePriceChecker = function () {
	botActive = false;
};

const addListeners = function () {
	try {
		enablePriceChecker();
	} catch (e) {
		console.log(e);
	}
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
