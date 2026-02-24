import { useState } from 'react'
import PlayerHand from './PlayerHand'
import PlayerSlot from './PlayerSlot'
import TableArea from './TableArea'
import './TestView.css'

const	mockGameState = {
	players: [
		{ id: 1, username: "Johnny", cardCount: 7, isTurn: false },
		{ id: 2, username: "Vincent", cardCount: 6, isTurn: true },
		{ id: 3, username: "Jackie", cardCount: 6, isTurn: false },
		{ id: 4, username: "You", cardCount: 3, isTurn: false },
	],
	myHand: [
		{ id: "c1", label: 10 },
		{ id: "c2", label: 7 },
		{ id: "c3", label: 2 },
	],
}

function TestView () {
	const	[gameState, setGameState] = useState(mockGameState)

	const opponents = gameState.players.filter(p => p.username !== "You")
	const myData = gameState.players.find(p => p.username === "You")

	return (
		<div className='gameboard'>
			<div className='opponents-area'>
				{opponents.map(player => (
					<PlayerSlot key={player.id} player={player} />
				))}
			</div>

			<TableArea />

			<PlayerHand cards={gameState.myHand} />
		</div>
	)
}

export default TestView
