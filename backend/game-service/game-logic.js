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

export function createGame(players) {

}

export function getHighestCard(cards) {
	let highestCard = cards[0];
	
	for (let current = 0; current < cards.length; ++current)
	{
		if (cards[current].value > highestCard.value)
			highestCard = cards[current];
	}
	return highestCard;
}

export function getLowestCard(cards) {
	let lowestCard = cards[0];

	for (let current = 0; current < cards.length; ++ current)
	{
		if (cards[current].value < lowestCard.value)
			lowestCard = cards[current],
	}
	return lowestCard;
}

export function flipMiddleCard(state, position) {

}

export function removeCard(state, cardID) {

}

export function shuffleAndDistribute(deck, players) {

}

export function executeAction(state, action) {

}

export function nextPlayer(state) {

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
	if (value1 == value2 && value1 == value3 && value2 == value3)
		return true;
	else	
		return false;
}

export function checkWinConditions(gameStruct) {
	const players = gameStruct.players;
	let winner = null;

	for (let current = 0; current < players.length; ++current)
	{
		if (players[current].trioWonNumber === 3)
		{
			winner = players[current];
			break;
		}
		else
		{
			const trioWonArray = players[current].trioWonArray;
			for (let i = 0; i < trioWonArray.length; ++i)
			{
				if (trioWonArray[i].value === 7)
				{
					winner = players[current];
					break;
				}
			}
			if (winner !== null)
				break;
		}
	}
	return winner;
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