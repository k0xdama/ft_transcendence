import { randomInt } from 'crypto';

export const GAME_MODES = {
	CLASSIC: 'CLASSIC',
	LINKED: 'LINKED'
};

export const GAME_TYPES = {
	SOLO: 'SOLO',
	TEAM_UP: 'TEAM_UP'
};

export const ACTIONS = {
	PLAYER_HIGHEST: 'PLAYER_HIGHEST',
	PLAYER_LOWEST: 'PLAYER_LOWEST',
	FLIP_MIDDLE: 'FLIP_MIDDLE'
};

export const ACTIONS_NUMBER = {
	FIRST: 'FIRST',
	SECOND: 'SECOND',
	BONUS: 'BONUS'
};

export const EVENTS = {
	PAIR_FOUND: 'PAIR_FOUND',
	TRIO_FOUND: 'TRIO_FOUND',
	PAIR_MISSED: 'PAIR_MISSED',
	TRIO_MISSED: 'TRIO_MISSED'
};

//   const gameStruct = {
//     gameId: ...,
// 	creatorId:...
//     gameMode: ...,
//     players: ...,
//     currentPlayerIndex: ...,
//     currentPlayer: ...,
//     currentAction: ...,
//     cardsInMiddle: [],
//     cardsRevealed: [],
//     validatedTrios: {},
//     stats: {},
//     startTime: ...
//   };

export function createGame(gameId, gameMode, gameType, creatorId) {
	const gameStruct = {
		gameId: gameId,
		creatorId: creatorId,
		gameMode: gameMode,
		gameType: gameType,
		players: [],
		expectedUsersIds: [],
		expectedPlayers: null,
		cardsInMiddle: [],
		cardsRevealed: [],
		trioWonArray: {},
		stats: {}
	};

	return gameStruct;
}

export function startGame(gameStruct) {
	console.log('in StartGame');
	gameStruct.currentPlayerIndex = 0;
	gameStruct.currentPlayer = gameStruct.players[0].id;
	gameStruct.currentAction = ACTIONS_NUMBER.FIRST;
	gameStruct.start = Date.now();

	for (const player of gameStruct.players) {
		gameStruct.trioWonArray[player.id] = [];
		gameStruct.stats[player.id] = {
			actionsPlayed: 0,
			combo: 0,
			trioOf7: 0
		};
	}
	const deck = createDeck();
	shuffleAndDistribute(gameStruct, deck);
}

export function addPlayer(gameStruct, playerId) {
	const player = {
		id: playerId,
		hand: []
	};
	gameStruct.players.push(player);
}

export function createDeck() {
	const deck = [];

	for (let i = 1; i <= 12; ++i) {
		for (let j = 1; j <= 3; ++j) {
			const card = {
				value: i,
				id: `${i}-${j}`
			};
			deck.push(card);
		}
	}

	return deck;
}

export function getHighestCard(gameStruct, cards) {
	let highestCard = cards[0];
	
	for (let current = 0; current < cards.length; ++current) {
		if (cards[current].value > highestCard.value)
			highestCard = cards[current];
	}
	highestCard.revealed = true;
	gameStruct.cardsRevealed.push(highestCard);
	return highestCard;
}

export function getLowestCard(gameStruct, cards) {
	let lowestCard = cards[0];

	for (let current = 0; current < cards.length; ++current) {
		if (cards[current].value < lowestCard.value)
			lowestCard = cards[current];
	}
	lowestCard.revealed = true;
	gameStruct.cardsRevealed.push(lowestCard);
	return lowestCard;
}

export function flipMiddleCard(gameStruct, position) {
	// const card = {
	// 	value: gameStruct.cardsInMiddle[position].value,
	// 	id: gameStruct.cardsInMiddle[position].id,
	// 	revealed: gameStruct.cardsInMiddle[position].revealed
	// }; CREE UN NOUVEL OBJET ET COPIE LES CHAMPS MANUELLEMENT
	// const card = { ...gameStruct.cardsInMiddle[position]}; CREE UN NOUVEL OBJET ET COPIE TOUT LES CHAMPS AUTOMATIQUEMENT
	const card = gameStruct.cardsInMiddle[position];
	card.revealed = true;
	gameStruct.cardsRevealed.push(card);
	return card;
}

export function removeCard(gameStruct, cardId) {
	gameStruct.cardsInMiddle = gameStruct.cardsInMiddle.filter(card => card.id !== cardId);

	for (const player of gameStruct.players) {
		player.hand = player.hand.filter(card => card.id !== cardId);
	}
}

export function shuffleAndDistribute(gameStruct, deck) {
	const players = gameStruct.players;
	let nbInMiddle = 0;
	let nbByPlayer = 0;

	switch (gameStruct.players.length) {
		case 3: 
			nbInMiddle = 9, nbByPlayer = 9; break;
		case 4: 
			nbInMiddle = 7, nbByPlayer = 8; break;
		case 5: 
			nbInMiddle = 6, nbByPlayer = 6; break;
		case 6: 
			nbInMiddle = 5, nbByPlayer = 6; break;
	}
	const shuffled = [...deck];
	console.log('deck avant shuffle:', shuffled.map(c => c.value));
	for (let i = shuffled.length - 1; i > 0; --i) {
		const j = randomInt(0, i + 1);
		console.log('loop i & j : ', i, '- ', j);
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}

	console.log('deck après shuffle:', shuffled.map(c => c.value));

	for (const player of gameStruct.players) {
		player.hand = [];
	}

	for (let round = 0; round < nbByPlayer; ++round) {
		for (const player of gameStruct.players) {
			player.hand.push(shuffled.shift());
		}
	}
	console.log('deck après distribution:', shuffled.map(c => c.value));
	gameStruct.cardsInMiddle = shuffled;
}
// if action is FLIP_MIDDLE target parameter gonna be the card position, else if action is ASK_LOWEST/HIGHEST so target gonna be the player's id targeted by the action
// manque : stats (actionplayed + combo + trioof7)
export function executeAction(gameStruct, actionType, target) {
	let return_object = {
		event: null,
		revealedCard: null,
		actionDone: null,
		target: null,
		turnEnded: false,
		nextAction: null,
	}
	let card = null;
	let players = gameStruct.players;

	switch (actionType) {
		case ACTIONS.FLIP_MIDDLE:
			card = flipMiddleCard(gameStruct, target);
			return_object.actionDone = actionType;
			return_object.target = target;
			break;
		case ACTIONS.PLAYER_LOWEST: {
			let hand = null;
			for (let player of players) {
				if (player.id === target)
					hand = player.hand;
			}
			card = getLowestCard(gameStruct, hand);
			return_object.actionDone = actionType;
			return_object.target = target;
			break;
		}
		case ACTIONS.PLAYER_HIGHEST: {
			let hand = null;
			for (let player of players) {
				if (player.id === target)
					hand = player.hand;
			}
			card = getHighestCard(gameStruct, hand);
			return_object.actionDone = actionType;
			return_object.target = target;
			break;
		}
	}

	switch (gameStruct.currentAction) {
		case ACTIONS_NUMBER.FIRST:
			return_object.revealedCard = card;
			return_object.nextAction = ACTIONS_NUMBER.SECOND;
			break;  
		case ACTIONS_NUMBER.SECOND:
			return_object.revealedCard = card;
			if (checkForPair(gameStruct.cardsRevealed) === true) {
				return_object.event = EVENTS.PAIR_FOUND;
				return_object.nextAction = ACTIONS_NUMBER.BONUS;
			}
			else {
				return_object.event = EVENTS.PAIR_MISSED;
				return_object.turnEnded = true;
				return_object.nextAction = ACTIONS_NUMBER.FIRST;
				gameStruct.cardsRevealed = [];
				nextPlayer(gameStruct);
			}
			break;
		case ACTIONS_NUMBER.BONUS: {
			return_object.revealedCard = card;
			if (checkForTrio(gameStruct.cardsRevealed) === true) {
				return_object.event = EVENTS.TRIO_FOUND;
				gameStruct.trioWonArray[gameStruct.currentPlayer].push(card.value);
				for (const cardToRemove of gameStruct.cardsRevealed) {
					removeCard(gameStruct, cardToRemove.id);
				}
			}
			else
				return_object.event = EVENTS.TRIO_MISSED;
			return_object.turnEnded = true;
			return_object.nextAction = ACTIONS_NUMBER.FIRST;
			gameStruct.cardsRevealed = [];
			nextPlayer(gameStruct);
			break;
		}
	}

	gameStruct.currentAction = return_object.nextAction;

	return return_object;
}

export function nextPlayer(gameStruct) {
	const nextIndex = (gameStruct.currentPlayerIndex + 1) % gameStruct.players.length;
	gameStruct.currentPlayerIndex = nextIndex;
	gameStruct.currentPlayer = gameStruct.players[nextIndex].id;
}

export function endTurn() {

}

export function checkForPair(cards) {
	const value1 = cards[0].value;
	const value2 = cards[1].value;
	if (value1 == value2)
		return true;
	else
		return false;
}

export function checkForTrio(cards) {
	const value1 = cards[0].value;
	const value2 = cards[1].value;
	const value3 = cards[2].value;
	if (value1 === value2 && value1 === value3 && value2 === value3)
		return true;
	else	
		return false;
}

export function checkWinConditions(gameStruct) {
	for (const player of gameStruct.players) {
		const trios = gameStruct.trioWonArray[player.id];

		if (trios.length === 3)
			return (player);
		for (let i = 0; i < trios.length; ++i) {
			if (trios[i].value === 7)
				return (player);
		}
	}
	return null;
}

export function getLinkedValues(cardValue) {
	const LINKS = {
		1: [6, 8],
		2: [5, 9],
		3: [4, 10],
		4: [3, 11],
		5: [2, 12],
		6: [1],
		7: [],
		8: [1],
		9: [2],
		10: [3],
		11: [4],
		12: [5]
	};
	return LINKS[cardValue] || [];
}