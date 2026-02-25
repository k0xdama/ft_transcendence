import { useState } from 'react'
import PlayerHand from './PlayerHand'
import PlayerSlot from './PlayerSlot'
import TableArea from './TableArea'
import './TestView.css'

const SEAT_POSITIONS = ["top", "left", "right", "top-left", "top-right"]

const	mockGameState = {
	players: [
		{ id: 1, username: "Opponent 1", cardCount: 7, isTurn: false },
		{ id: 2, username: "Opponent 2", cardCount: 6, isTurn: true },
		{ id: 3, username: "Opponent 3", cardCount: 4, isTurn: false },
		// { id: 4, username: "Opponent 4", cardCount: 5, isTurn: false },
		{ id: 5, username: "You", cardCount: 3, isTurn: false },
	],
	myHand: [
		{ id: "c1", label: 10 },
		{ id: "c2", label: 7 },
		{ id: "c3", label: 2 },
	],
}

function TestView () {
	const	[gameState, setGameState] = useState(mockGameState)

	const	opponents = gameState.players.filter(p => p.username !== "You")
	const	myData = gameState.players.find(p => p.username === "You")
	const	seatedOpponents = opponents.map((player, index) => ({
		player,
		seat: SEAT_POSITIONS[index]
	}))

	return (
		<div className='gameboard'>
			{seatedOpponents.map(({player, seat}) => (
				<PlayerSlot key={player.id} player={player} seat={seat} />
			))}

			<TableArea />

			<PlayerHand cards={gameState.myHand} />
		</div>
	)
}

export default TestView
