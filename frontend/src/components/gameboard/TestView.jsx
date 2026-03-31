import { useState, useEffect } from 'react'
import PlayerHand from './PlayerHand'
import PlayerSlot from './PlayerSlot'
import TableArea from './TableArea'
import ChatOverlay from './ChatOverlay'


const LAYOUTS = {
	3: {
		seats: ["top", "left"],
		playerSeat: "bottom-center"
	},
	4: {
		seats: ["top", "left", "right"],
	playerSeat: "bottom-center"
	},
	5: {
		seats: ["top-left", "top-right", "left", "right"],
		playerSeat: "bottom-right"
	},
	6: {
		seats: ["top-left", "top-right", "left", "right", "bottom-left"],
		playerSeat: "bottom-right"
	}
}

const SEAT_POSITIONS = ["top", "left", "right", "top-left", "top-right"]

const ALL_PLAYERS = [
	{ id: 1, username: "Opponent 1", cardCount: 5, trios: [1, 5] },
	{ id: 2, username: "Opponent 2", cardCount: 5, trios: [3] },
	{ id: 3, username: "Opponent 3", cardCount: 5, trios: [11] },
	{ id: 4, username: "Opponent 4", cardCount: 5, trios: [9] },
	{ id: 5, username: "Opponent 5", cardCount: 5, trios: [] },
	{ id: 6, username: "You", cardCount: 5, trios: [12, 6]},
]

const MY_HAND = [
	{ id: "c1", label: 10 },
	{ id: "c2", label: 7 },
	{ id: "c3", label: 8 },
	{ id: "c3", label: 4 },
	{ id: "c3", label: 2 },
]

const MY_TRIOS = [12, 6]

const RIVER_COUNT = {
	3: {total: 9, cols: 3},
	4: {total: 8, cols: 4},
	5: {total: 6, cols: 3},
	6: {total: 6, cols: 3},
}

function TestView () {
	const	[playerCount, setPlayerCount] = useState(3)
	const	opponents = ALL_PLAYERS.slice(0, playerCount - 1)
	const	{total, cols} = RIVER_COUNT[playerCount]
	const	layout = LAYOUTS[playerCount]
	const	seatedOpponents = opponents.map((player, index) => ({
		player,
		seat: layout.seats[index]
	}))

	useEffect(() => {
		document.body.classList.add("gameboard-active")

		return () => {
			document.body.classList.remove("gameboard-active")
		}
	}, [])

	const addPlayer = () => setPlayerCount(c => Math.min(c + 1, 6))
	const removePlayer = () => setPlayerCount(c => Math.max(c - 1, 3))

	return (
		<div className='gameboard'>
			{seatedOpponents.map(({player, seat}) => (
				<PlayerSlot key={player.id} player={player} seat={seat} />
			))}

			<TableArea total={total} cols={cols} />

			<PlayerHand cards={MY_HAND} seat={layout.playerSeat} trios={MY_TRIOS}/>

			<ChatOverlay roomId="00000000-0000-0000-0000-000000000001" />

			<div className='demo-controls'>
				<button onClick={removePlayer} disabled={playerCount <= 3}>-</button>
				<span>{playerCount} players</span>
				<button onClick={addPlayer} disabled={playerCount >= 6}>+</button>
			</div>
		</div>
	)
}

export default TestView
