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

const chartCommands = {
	'!pvu': {
		id: 'plant-vs-undead-token',
		icon: '🍀',
	},
	'!slp': {
		id: 'smooth-love-potion',
		icon: '🩸',
	},
	'!axs': {
		id: 'axie-infinity',
		icon: '🪓',
	},
	'!dnxc': {
		id: 'dinox',
		icon: '🦖',
	},
	'!pkmon': {
		id: 'polkamonster',
		icon: '🐲',
	},
	'!dpet': {
		id: 'my-defi-pet',
		icon: '🐶',
	},
	'!cyt': {
		id: 'coinary-token',
		icon: '🐉',
	},
	'!skill': {
		id: 'cryptoblades',
		icon: '⚔️',
	},
};

const selectors = {
	messages: '#main span.selectable-text.copyable-text',
	messageArea: '#main > footer div.selectable-text[contenteditable]',
	sendMessageButton: '#main > footer > div.copyable-area > div > div > div > button',
	// query all and get the last element
	sendImageButton:
		'#app > div.app-wrapper-web.font-fix > div.two > div > div > span > div > span > div > div > div > div > div > div > div > div',
};
let botActive;

const timer = (ms) => new Promise((res) => setTimeout(res, ms));

const sendMessage = function (message) {
	window.InputEvent = window.Event || window.InputEvent;

	const event = new InputEvent('input', {
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

const publishChart = function (coinId) {
	const getChartB64 = async (prices) => {
		const data = prices.map((p) => {
			return { x: new Date(p[0]), y: p[1] };
		});
		const options = {
			series: [
				{
					name: 'Preço',
					data: data,
				},
			],
			chart: {
				height: 350,
				type: 'line',
				zoom: {
					enabled: false,
				},
			},
			dataLabels: {
				enabled: false,
			},
			stroke: {
				curve: 'straight',
			},
			title: {
				text: 'Gráfico',
				align: 'center',
			},
			grid: {
				row: {
					colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
					opacity: 0.5,
				},
			},
			xaxis: {
				type: 'datetime',
			},
			yaxis: {
				tooltip: {
					enabled: true,
				},
			},
		};

		const chartDiv = document.createElement('div');
		chartDiv.setAttribute('id', 'temp-chart');
		const body = document.querySelector('body');
		body.appendChild(chartDiv);
		const tempChart = document.querySelector('#temp-chart');

		const chart = new ApexCharts(tempChart, options);
		chart.render();
		await timer(3000);
		const { imgURI } = await chart.dataURI();
		tempChart.remove();

		return imgURI;
	};
	const b64toBlob = async (b64Data) => {
		const res = await fetch(b64Data);
		const blob = await res.blob();
		return blob;
	};
	const setToClipboard = async (blob) => {
		await navigator.clipboard.writeText('');
		const data = [new ClipboardItem({ [blob.type]: blob })];
		await navigator.clipboard.write(data);
	};
	const sendChart = async () => {
		const messageArea = document.querySelector(selectors.messageArea);
		messageArea.focus();
		document.execCommand('paste', null, null);
		await timer(2000);
		const buttons = document.querySelectorAll(selectors.sendImageButton);
		const sendImageButton = buttons[buttons.length - 1];
		sendImageButton.click();
	};
	chrome.runtime.sendMessage(
		{
			contentScriptQuery: 'getChart',
			coinId: coinId,
		},
		async function (res) {
			console.log('res: ', res);
			if (res) {
				const chartB64 = await getChartB64(res.prices);
				const chartBlob = await b64toBlob(chartB64);
				await setToClipboard(chartBlob);
				await sendChart();
			} else {
				sendMessage(`Bot Indisponível 😢`);
			}
		}
	);
};

/*----------------------------------------------------------*/

const enablePriceChecker = async function () {
	botActive = true;
	while (botActive) {
		const lastMessage = getLastMessage();
		if (priceCommands.hasOwnProperty(lastMessage)) {
			publishCoinPrice(priceCommands[lastMessage].id);
			await timer(5000);
		}
		if (chartCommands.hasOwnProperty(lastMessage)) {
			sendMessage(`Gerando gráfico...`);
			publishChart(chartCommands[lastMessage].id);
			await timer(5000);
		}
		if (lastMessage === '/trend' || lastMessage === '/trends' || lastMessage === '/trending') {
			publishTrending();
			await timer(5000);
		}
		if (lastMessage === '/list' || lastMessage === '/commands') {
			const commands = Object.keys(priceCommands);
			let message = `📈 *Comandos* 📈\n`;
			message += `/commands\n`;
			message += `/owner\n`;
			message += `/trends\n\n`;
			message += `*Coloque \\ para cotação e ! para gráfico* \n`;
			commands.forEach((command) => {
				message += `${command.replace('/', '')}\n`;
			});
			sendMessage(message);
			await timer(5000);
		}
		if (lastMessage === '/owner') {
			sendMessage('Olá, meu nome é Alexandre Calil (@xandao6) e eu sou o criador do bot de preços do Whatsapp.');
			await timer(5000);
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
