import { randomInt } from 'crypto'

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
		riverSlots: [],
		trioWonArray: {},
		lastTrioWinner: null,
		eliminationOrder: [],
		stats: {}
	};

	return (gameStruct);
}

export function startGame(gameStruct) {
	console.log('in StartGame');
	gameStruct.currentPlayerIndex = randomInt(0, gameStruct.players.length);
	gameStruct.currentPlayer = gameStruct.players[gameStruct.currentPlayerIndex].id;
	gameStruct.currentAction = ACTIONS_NUMBER.FIRST;
	gameStruct.start = Date.now();

	for (const player of gameStruct.players) {
		gameStruct.trioWonArray[player.id] = [];
		gameStruct.stats[player.id] = {
			won: false,
			rank: 0,
			score: 0,
			actionsPlayed: 0,
			combo: 0,
			trioOf7: 0
		};
	}
	const deck = createDeck();
	shuffleAndDeal(gameStruct, deck);
}

export function addPlayer(gameStruct, playerId, playerUsername) {
	const player = {
		id: playerId,
		username: playerUsername,
		hand: [],
		connected: true,
		eliminated: false,
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

	return (deck);
}

export function getHighestCard(gameStruct, cards) {
    const notRevealedCards = cards.filter(card => !gameStruct.cardsRevealed.includes(card));
    let highestCard = notRevealedCards[0];

    for (let current = 1; current < notRevealedCards.length; ++current) {
        if (notRevealedCards[current].value > highestCard.value)
            highestCard = notRevealedCards[current];
    }
    highestCard.revealed = true;
    gameStruct.cardsRevealed.push(highestCard);
    return highestCard;
}

export function getLowestCard(gameStruct, cards) {
    const notRevealedCards = cards.filter(card => !gameStruct.cardsRevealed.includes(card));
    let lowestCard = notRevealedCards[0];

    for (let current = 1; current < notRevealedCards.length; ++current) {
        if (notRevealedCards[current].value < lowestCard.value)
            lowestCard = notRevealedCards[current];
    }
    lowestCard.revealed = true;
    gameStruct.cardsRevealed.push(lowestCard);
    return lowestCard;
}

export function flipMiddleCard(gameStruct, cardId) {
	console.log("flipMiddleCard : cardId = ", cardId);
	const card = gameStruct.cardsInMiddle.find(card => card.id === cardId);
	if (card === undefined) {
		console.log("WARN ! This card is not existing anymore, bad cardId");
		return null;
	}
	card.revealed = true;
	gameStruct.cardsRevealed.push(card);
	return (card);
}

export function removeCard(gameStruct, cardId) {
	gameStruct.cardsInMiddle = gameStruct.cardsInMiddle.filter(card => card.id !== cardId);
	gameStruct.riverSlots = gameStruct.riverSlots.map(slot => slot === null ? null : (slot.id === cardId ? null : slot));

	for (const player of gameStruct.players) {
		player.hand = player.hand.filter(card => card.id !== cardId);
	}
}

function	sortPlayerHand(hand) {
	let sortedHand = [];
	let lowerIndex = 0;
	let i = 0;

	while (hand.length !== 0) {
		if (i === hand.length) {
			sortedHand.push(hand.splice(lowerIndex, 1)[0]);
			i = 0;
			lowerIndex = 0;
			continue;
		}
		if (hand[i].value < hand[lowerIndex].value)
			lowerIndex = i;
		i++;
	}
	return (sortedHand);
}

export function shuffleAndDeal(gameStruct, deck) {
	const players = gameStruct.players;
	let nbInMiddle = 0;
	let nbByPlayer = 0;

	switch (gameStruct.players.length) {
		case 3: 
			nbInMiddle = 9, nbByPlayer = 9; break;
		case 4: 
			nbInMiddle = 8, nbByPlayer = 7; break;
		case 5: 
			nbInMiddle = 6, nbByPlayer = 6; break;
		case 6: 
			nbInMiddle = 6, nbByPlayer = 5; break;
	}
	const shuffled = [...deck];
	console.log('deck avant shuffle:', shuffled.map(c => c.value));
	for (let i = shuffled.length - 1; i > 0; --i) {
		const j = randomInt(0, i + 1);
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

	for (const player of gameStruct.players)
		player.hand = sortPlayerHand(player.hand);
	console.log('deck après distribution:', shuffled.map(c => c.value));

	gameStruct.cardsInMiddle = shuffled;
	gameStruct.riverSlots = shuffled.map(card => ({ id: card.id }));
}
// if action is FLIP_MIDDLE target parameter gonna be the cardId, else if action is ASK_LOWEST/HIGHEST so target gonna be the player's id targeted by the action
export function executeAction(gameStruct, actionType, target) {
	let return_object = {
		event: null,
		revealedCard: null,
		actionDone: null,
		target: null,
		turnEnded: false,
		nextAction: null,
		winner: null
	}
	let card = null;
	let players = gameStruct.players;
	gameStruct.stats[gameStruct.currentPlayer].actionsPlayed++;

	switch (actionType) {
		case ACTIONS.FLIP_MIDDLE:
			card = flipMiddleCard(gameStruct, target);
			if (card === null)
				return return_object;
			return_object.actionDone = actionType;
			return_object.target = target;
			break;
		case ACTIONS.PLAYER_LOWEST: {
			let hand = null;
			for (let player of players) {
				if (player.id === target)
					hand = player.hand;
			}
			if (!hand || hand.length === 0)
				return { error: 'This player has no cards left' };
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
			}
			break;
		case ACTIONS_NUMBER.BONUS: {
			return_object.revealedCard = card;
			if (checkForTrio(gameStruct.cardsRevealed) === true) {
				return_object.event = EVENTS.TRIO_FOUND;
				console.log("Trio found ! ", card.value);
				gameStruct.trioWonArray[gameStruct.currentPlayer].push(card.value);
				for (const cardToRemove of gameStruct.cardsRevealed) {
					removeCard(gameStruct, cardToRemove.id);
					console.log("cardRemoved : ", card.id);
				}
				if (gameStruct.lastTrioWinner === gameStruct.currentPlayer)
					gameStruct.stats[gameStruct.currentPlayer].combo++;
				gameStruct.lastTrioWinner = gameStruct.currentPlayer;
				return_object.winner = checkWinConditions(gameStruct);
				if (return_object.winner !== null) {
					console.log("winnerId: ", return_object.winner.winnerId);
					if (return_object.winner.reason === 'TRIO_OF_7') {
						gameStruct.stats[gameStruct.currentPlayer].score += 2;
						gameStruct.stats[gameStruct.currentPlayer].trioOf7 = 1;
					}
					return (return_object);
				}
				gameStruct.stats[gameStruct.currentPlayer].score++;
			}
			else
				return_object.event = EVENTS.TRIO_MISSED;
			return_object.turnEnded = true;
			return_object.nextAction = ACTIONS_NUMBER.FIRST;
			break;
		}
	}

	gameStruct.currentAction = return_object.nextAction;
	return (return_object);
}

export function nextPlayer(gameStruct) {
	let attempt = 0;
	let nextIndex = (gameStruct.currentPlayerIndex + 1) % gameStruct.players.length;
	while (gameStruct.players[nextIndex].connected === false || gameStruct.players[nextIndex].eliminated === true) {
		nextIndex = (nextIndex + 1) % gameStruct.players.length;
		attempt++;
		if (attempt === gameStruct.players.length)
			return ;
	}
	gameStruct.currentPlayerIndex = nextIndex;
	gameStruct.currentPlayer = gameStruct.players[nextIndex].id;
	return ;
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
	let win_object = {
		winnerId : null,
		reason: null
	};

	const currentPlayer = gameStruct.currentPlayer;
	const triosWonArray = gameStruct.trioWonArray[currentPlayer];

	for (let i = 0; i < triosWonArray.length; ++i) {
		if (triosWonArray[i] === 7) {
			win_object.winnerId = currentPlayer;
			win_object.reason = 'TRIO_OF_7';
			return (win_object);
		}
	}

	switch (gameStruct.gameMode) {
		case GAME_MODES.CLASSIC : {
			if (triosWonArray.length === 3) {
				win_object.winnerId = currentPlayer;
				win_object.reason = 'THREE_TRIOS';
				return (win_object);
			}
			break;
		}
		case GAME_MODES.LINKED : {
			const lastTrioValue = triosWonArray[triosWonArray.length - 1];
			for (let i = 0; i < triosWonArray.length - 1; ++i) {
				const valueArray = getLinkedValues(triosWonArray[i]);
				for (const value of valueArray) {
					if (value === lastTrioValue) {
						win_object.winnerId = currentPlayer;
						win_object.reason = 'LINKED_TRIOS';
						return (win_object);
					}
				}
			}
			break;
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
	return (LINKS[cardValue] || []);
}

function	setPlayersRank(gameStruct, winnerId) {
	const stats = gameStruct.stats;
	const rankArray = [];
	for (const player of gameStruct.players) {
		if (player.id === winnerId) {
			stats[player.id].rank = 1;
			stats[player.id].won = true;
		}
		else {
			rankArray.push({
				id: player.id,
				trios: gameStruct.trioWonArray[player.id].length
			});
		}
	}

	for (let i = 0; i < rankArray.length; ++i) {
		for (let j = (i + 1); j < rankArray.length; ++j) {
			if (rankArray[i].trios < rankArray[j].trios) {
				let tmp = rankArray[i];
				rankArray[i] = rankArray[j];
				rankArray[j] = tmp;
			}
		}
	}

	let currentRank = 2;
	for (let i = 0; i < rankArray.length; ++i) {
		if (i > 0 && rankArray[i].trios < rankArray[i - 1].trios)
			currentRank = currentRank + 1;
		stats[rankArray[i].id].rank = currentRank;
	}
}

function checkForPerfectGame(gameStruct, winnerId) {
	for (const player of gameStruct.players) {
		if (player.id === winnerId)
			continue;
		if (gameStruct.trioWonArray[player.id].length !== 0)
			return (false);
	}
	return (true);
}

export function buildGameStats(gameStruct, winnerId) {
	const dateObject = new Date(Date.now());
	const gameStats_object = {
		gameId: gameStruct.gameId,
		gameType: gameStruct.gameType,
		gameMode: gameStruct.gameMode,
		ended: dateObject.toISOString(),
		duration: Math.floor((dateObject.getTime() - gameStruct.start) / 1000),
		players: []
	};
	const stats = gameStruct.stats;
	const perfectGame = checkForPerfectGame(gameStruct, winnerId);
	setPlayersRank(gameStruct, winnerId);
	for (const player of gameStruct.players) {
		const playerStats = stats[player.id];
		const playerObject = {
			userId: player.id,
			won: playerStats.won,
			rank: playerStats.rank,
			score: playerStats.score,
			actionsPlayed: playerStats.actionsPlayed,
			achievements: {
				TRIO_OF_7: playerStats.trioOf7,
				COMBO: playerStats.combo,
				PERFECT_GAME: (player.id === winnerId && perfectGame) ? 1 : 0
			}
		};
		gameStats_object.players.push(playerObject);
	}
	return (gameStats_object);
}

