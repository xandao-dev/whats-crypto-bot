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
	'/bin': {
		id: 'binemon',
		icon: '🦧',
	},
	'/mist': {
		id: 'mist',
		icon: '🧙🏼‍♂️',
	},
	'/derc': {
		id: 'derace',
		icon: '🐎',
	},
	'/mbox': {
		id: 'mobox',
		icon: '💵',
	},
	'/sps': {
		id: 'splinterlands',
		icon: '🃏',
	},
	'/ilv': {
		id: 'illuvium',
		icon: '💎',
	},
	'/btc': {
		id: 'bitcoin',
		icon: '🪙',
	},
	'/bnb': {
		id: 'binancecoin',
		icon: '🪙',
	},
	'/eth': {
		id: 'ethereum',
		icon: '🪙',
	},
	'/doge': {
		id: 'dogecoin',
		icon: '🪙',
	},
	'/shib': {
		id: 'shiba-inu',
		icon: '🪙',
	},
	'/matic': {
		id: 'polygon',
		icon: '🪙',
	},
	'/ada': {
		id: 'cardano',
		icon: '🪙',
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
	'!bin': {
		id: 'binemon',
		icon: '🦧',
	},
	'!derc': {
		id: 'derace',
		icon: '🐎',
	},
	'!mbox': {
		id: 'mobox',
		icon: '💵',
	},
	'!sps': {
		id: 'splinterlands',
		icon: '🃏',
	},
	'!ilv': {
		id: 'illuvium',
		icon: '💎',
	},
	'!btc': {
		id: 'bitcoin',
		icon: '🪙',
	},
	'!bnb': {
		id: 'binancecoin',
		icon: '🪙',
	},
	'!eth': {
		id: 'ethereum',
		icon: '🪙',
	},
	'!doge': {
		id: 'dogecoin',
		icon: '🪙',
	},
	'!shib': {
		id: 'shiba-inu',
		icon: '🪙',
	},
	'!matic': {
		id: 'polygon',
		icon: '🪙',
	},
	'!ada': {
		id: 'cardano',
		icon: '🪙',
	},
};

const selectors = {
	/*General*/
	messages: '#main div.focusable-list-item[class*=message]',
	messageIdentifier: '.selectable-text.copyable-text',
	messageArea: '#main > footer div.selectable-text[contenteditable]',
	sendMessageButton: '#main > footer button > [data-icon*=send]',

	/*Price Graph*/
	sendImageButton: '#app div[role=button] > [data-icon*=send]',
};
let priceChecker;
let priceGraph;

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
	const lastMessageElement = messages[messages.length - 1];
	const lastMessage = lastMessageElement?.querySelector(selectors.messageIdentifier);
	return lastMessage?.textContent || '';
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
Sentimento positivo: ${res.sentiment_up}%`
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
				message += `Top 7 na CoinGecko (24h)\n`;
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
	const getChartB64 = async (prices, coinName) => {
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
				height: 500,
				type: 'area',
			},
			dataLabels: {
				enabled: false,
			},
			stroke: {
				curve: 'smooth',
				width: 1.5,
			},
			fill: {
				type: 'gradient',
				gradient: {
					shadeIntensity: 1,
					opacityFrom: 0.7,
					opacityTo: 0.9,
					stops: [0, 90, 100],
				},
			},
			title: {
				text: `${coinName} (15d)`,
				align: 'center',
			},
			grid: {
				row: {
					colors: ['#f3f3f3'], // takes an array which will be repeated on columns
					opacity: 0.5,
				},
			},
			xaxis: {
				type: 'datetime',
			},
			yaxis: {
				labels: {
					formatter: function (value) {
						const format = (num, decimals) =>
							num.toLocaleString('pt-BR', {
								minimumFractionDigits: decimals,
								maximumFractionDigits: decimals,
							});
						return `R$ ${format(value, 4)}`;
					},
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
		const sendImageButton = document.querySelector(selectors.sendImageButton);
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
				try {
					const chartB64 = await getChartB64(res.prices, res.name);
					const chartBlob = await b64toBlob(chartB64);
					await setToClipboard(chartBlob);
					await sendChart();
				} catch (e) {
					console.error('Error sending chat, check if whatsapp is focused');
				}
			} else {
				sendMessage(`Bot Indisponível 😢`);
			}
		}
	);
};
const execCommand = function (lastMessage) {
	const lastMessageLower = lastMessage?.toLowerCase();
	if (lastMessageLower === '/list' || lastMessageLower === '/commands') {
		const commands = Object.keys(priceCommands);
		let message = `📈 *Comandos* 📈\n`;
		message += `/commands ou /list\n`;
		message += `/creator\n`;
		message += `/trends\n\n`;

		message += `*Coloque / para cotação e ! para gráfico* \n`;
		message += `ex.: !bnb ou /slp\n\n`;

		commands.forEach((command) => {
			message += `${command.replace('/', '')};`;
		});
		sendMessage(message);
	}
	if (lastMessageLower === '/creator') {
		sendMessage('Olá, meu nome é Alexandre Calil (@xandao6) e eu sou o criador do bot de preços do Whatsapp.');
	}
	if (lastMessageLower === '/trend' || lastMessageLower === '/trends' || lastMessageLower === '/trending') {
		publishTrending();
	}

	if (priceCommands.hasOwnProperty(lastMessageLower)) {
		publishCoinPrice(priceCommands[lastMessageLower].id);
	}
	if (chartCommands.hasOwnProperty(lastMessageLower)) {
		sendMessage(`Gerando gráfico...`);
		publishChart(chartCommands[lastMessageLower].id);
	}
};

/*----------------------------------------------------------*/

const enablePriceChecker = async function () {
	priceChecker = true;
	let lastMessageTemp = '';
	while (priceChecker) {
		const lastMessage = getLastMessage();
		if (lastMessage !== lastMessageTemp && lastMessage.startsWith('/')) {
			// console.log(`Last message: ${lastMessage}`);
			execCommand(lastMessage);
			await timer(4000);
		}
		await timer(250);
		lastMessageTemp = lastMessage;
	}
};

const disablePriceChecker = function () {
	priceChecker = false;
};

const enablePriceGraph = async function () {
	priceGraph = true;
	let lastMessageTemp = '';
	while (priceGraph) {
		const lastMessage = getLastMessage();
		if (lastMessage !== lastMessageTemp && lastMessage.startsWith('!')) {
			// console.log(`Last message: ${lastMessage}`);
			execCommand(lastMessage);
			await timer(4000);
		}
		await timer(250);
		lastMessageTemp = lastMessage;
	}
};

const disablePriceGraph = function () {
	priceGraph = false;
};

//message listener for background
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.command === 'init-price-checker') {
		enablePriceChecker();
	} else if (request.command === 'remove-price-checker') {
		disablePriceChecker();
	}

	if (request.command === 'init-price-graph') {
		enablePriceGraph();
	} else if (request.command === 'remove-price-graph') {
		disablePriceGraph();
	}

	sendResponse({ result: 'success' });
});

//on init perform based on chrome storage value
window.onload = function () {
	chrome.storage.sync.get('priceCheckerEnabled', function (data) {
		if (data.priceCheckerEnabled) {
			enablePriceChecker();
		} else {
			disablePriceChecker();
		}
	});
	chrome.storage.sync.get('priceGraphEnabled', function (data) {
		if (data.priceGraphEnabled) {
			enablePriceGraph();
		} else {
			disablePriceGraph();
		}
	});
};
