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
	return messages[messages.length - 1]?.textContent || '';
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
				const chartB64 = await getChartB64(res.prices, res.name);
				const chartBlob = await b64toBlob(chartB64);
				await setToClipboard(chartBlob);
				await sendChart();
			} else {
				sendMessage(`Bot Indisponível 😢`);
			}
		}
	);
};
const execCommand = function (lastMessage) {
	if (lastMessage === '/list' || lastMessage === '/commands') {
		const commands = Object.keys(priceCommands);
		let message = `📈 *Comandos* 📈\n`;
		message += `/commands\n`;
		message += `/criador\n`;
		message += `/trends\n`;
		message += `/faq-pvu\n\n`;

		message += `*Coloque / para cotação e ! para gráfico* \n`;
		message += `ex.: !bnb ou /slp\n\n`;

		commands.forEach((command) => {
			message += `${command.replace('/', '')};`;
		});
		sendMessage(message);
	}
	if (lastMessage === '/criador') {
		sendMessage('Olá, meu nome é Alexandre Calil (@xandao6) e eu sou o criador do bot de preços do Whatsapp.');
	}
	if (lastMessage === '/trend' || lastMessage === '/trends' || lastMessage === '/trending') {
		publishTrending();
	}
	if (lastMessage === '/faq-pvu') {
		faq = `
*FAQ PVU*

CRIEI UMA CONTA HOJE, QUANDO POSSO JOGAR?
-----R: Em teoria 24hrs (nada oficial), mas o ideal é tentar a cada horário (GRUPO) e após o reset 21:00h Horário Brasília.
		
QUANTOS PVU PRECISO PARA JOGAR?
-----R: Min. 5 PVU para o básico, 16PVU para começar completo. Você é novato? comece pelo básico;
		
POSSO TER MAIS DE UMA CONTA DO PLANTS VS UNDEAD?
-----R: Sim! Há apenas duas regras: não é permitido mais de 1 conta por dispositivo e nem mais de 2 contas por IP (roteador no caso).	
				
NÃO SEI EM QUAL GRUPO ESTOU!
-----R: Tenha paciência, procure a tabela de horários feita pela comunidade e tente entrar de hora em hora até você conseguir, é assim que você descobre o grupo a qual irá pertencer.

COMO FAÇO A MISSÃO DIÁRIA E O QUE GANHO?
-----R: Para fazer a missão diária basta realizar 15 REGADAS OU CAPTURAR 5 CORVOS em plantas com -200 (quantidade de águas); Recompensa: 50 LE (GARANTIDOS) +  
30% para cair 100x de água e 20x de espantalhos
30% para cair 2x potes pequenos
30% para cair 1x muda de girassol
9,9% para cair 1x Sunflower Mama
0,1% para soltar 1x semente (NFT que vale muito dinheiro)

MEU DEUS, NÃO CONSIGO TIRAR MEU DINHEIRO O QUE HOUVE?
-----R: Para controlar a inflação da moeda o JOGO limita você a transformar LE>PVU em 3 em 3 dias.

SÓ APARECE QUE O JOGO ESTÁ EM MANUTENÇÃO, O QUE EU FAÇO?
-----R: Pode ser que não esteja no seu grupo (sua hora de jogar), tente novamente daqui 1h. 
		Mas também pode ser que o jogo esteja de fato em manutenção, o jogo está em uma fase BETA e em constante desenvolvimento.`;
		sendMessage(faq);
	}

	if (priceCommands.hasOwnProperty(lastMessage)) {
		publishCoinPrice(priceCommands[lastMessage].id);
	}
	if (chartCommands.hasOwnProperty(lastMessage)) {
		sendMessage(`Gerando gráfico...`);
		publishChart(chartCommands[lastMessage].id);
	}
};

/*----------------------------------------------------------*/

const enableChecker = async function () {
	botActive = true;
	let lastMessageTemp = '';
	while (botActive) {
		const lastMessage = getLastMessage();
		if (lastMessage !== lastMessageTemp) {
			execCommand(lastMessage);
			await timer(4000);
		}
		await timer(250);
		lastMessageTemp = lastMessage;
	}
};

const disableChecker = function () {
	botActive = false;
};

//message listener for background
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.command === 'init') {
		enableChecker();
	} else {
		disableChecker();
	}
	sendResponse({ result: 'success' });
});

//on init perform based on chrome storage value
window.onload = function () {
	chrome.storage.sync.get('priceCheckerEnabled', function (data) {
		if (data.priceCheckerEnabled) {
			enableChecker();
		} else {
			disableChecker();
		}
	});
};
