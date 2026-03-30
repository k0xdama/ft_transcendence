import { useParams } from 'react-router-dom'
import { useGame } from "../../context/GameContext"
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import PlayerHand from './PlayerHand'
import PlayerSlot from './PlayerSlot'
import TableArea from './TableArea'
import ChatOverlay from './ChatOverlay'
import './GameView.css'

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

function	GameView() {
	const	{ gameId } = useParams()
	const	{ gameStruct, connect, sendAction, sendCheck, pendingCheck } = useGame()
	const	{ user, accessToken } = useAuth()
	const [selectedOpponent, setSelectedOpponent] = useState(null)

	useEffect(() => {
		document.body.classList.add('gameboard-active')
		connect(accessToken, gameId)
		return () => document.body.classList.remove('gameboard-active')
	}, [])

	const	handleOpponentAction = (actionType) => {
		sendAction(gameId, actionType, selectedOpponent)
		setSelectedOpponent(null)
	}

	if (!gameStruct) return <p>Waiting for all players to connect...</p>

	const	me = gameStruct.players.find(p => p.id === user?.id)
	const	opponents = gameStruct.players.filter(p => p.id !== user?.id)
	const	isMyTurn = gameStruct?.currentPlayer === user?.id
	const	layout = LAYOUTS[gameStruct.players.length]
	const	river = gameStruct.cardsInMiddle
	const	currentAction = gameStruct.currentAction

	return (
		<div className='gameboard'>
			{opponents.map((player, index) => (
				<PlayerSlot
					key={player.id}
					player={{
						id: player.id,
						cardCount: player.hand.length,
						trios: gameStruct.trioWonArray[player.id] ?? []
					}}
					seat={layout.seats[index]}
					isCurrentPlayer={gameStruct.currentPlayer === player.id}
					isMyTurn={isMyTurn}
					onSelect={(opponentId) => setSelectedOpponent(opponentId)}
				/>
			))}

			<TableArea
				cards={river}
				isMyTurn={isMyTurn}
				onFlip={(index) => sendAction(gameId, 'FLIP_MIDDLE', index)}
			/>

			<PlayerHand
				cards={me.hand}
				seat={layout.playerSeat}
				trio={gameStruct.trioWonArray[me.id] ?? []}
			/>

			<ChatOverlay />

			{pendingCheck && (
				<button onClick={() => sendCheck(gameId)}>
					Continue
				</button>
			)}

			{selectedOpponent && (
				<div className='action-prompt-overlay' onClick={() => setSelectedOpponent(null)}>
					<div className='action-prompt' onClick={e => e.stopPropagation()}>
						<p className='prompt-title'>Choose an action</p>
						<div className='prompt-actions'>
							<button className='prompt-btn' onClick={() => handleOpponentAction('PLAYER_HIGHEST')}>
								Highest card
							</button>
							<button className='prompt-btn' onClick={() => handleOpponentAction('PLAYER_LOWEST')}>
								Lowest card
							</button>
						</div>
						<button className='prompt-cancel' onClick={() => setSelectedOpponent(null)}>Cancel</button>
					</div>
				</div>
			)}
		</div>
	)
}

export default GameView
