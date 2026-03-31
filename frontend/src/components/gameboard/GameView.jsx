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
	const	{ gameStruct, connect, sendAction, sendCheck, pendingCheck, lastAction } = useGame()
	const	{ user, accessToken } = useAuth()
	const	[selectedOpponent, setSelectedOpponent] = useState(null)
	const	[checkSent, setCheckSent] = useState(false)

	useEffect(() => {
		document.body.classList.add('gameboard-active')
		connect(accessToken, gameId)
		return () => document.body.classList.remove('gameboard-active')
	}, [])

	useEffect(() => {
		if (!pendingCheck) setCheckSent(false)
	}, [pendingCheck])

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
	const	expectedRevealed = { FIRST: 0, SECOND: 1, BONUS: 2 }
	const	canAct = isMyTurn && gameStruct.cardsRevealed.length === expectedRevealed[currentAction]

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
					isMyTurn={canAct}
					cardsRevealed={gameStruct.cardsRevealed}
					onSelect={(opponentId) => setSelectedOpponent(opponentId)}
					lastAction={lastAction}
				/>
			))}

			<TableArea
				cards={river}
				isMyTurn={isMyTurn}
				currentAction={currentAction}
				cardsRevealed={gameStruct.cardsRevealed}
				onFlip={(index) => sendAction(gameId, 'FLIP_MIDDLE', index)}
			/>

			<PlayerHand
				cards={me.hand}
				seat={layout.playerSeat}
				trios={gameStruct.trioWonArray[me.id] ?? []}
				isMyTurn={canAct}
				onSelectSelf={() => setSelectedOpponent(me.id)}
			/>

			<ChatOverlay />

			{pendingCheck && (
				<div className="check-prompt">
					<button
						className={`btn-check ${checkSent ? 'btn-check-sent' : ''}`}
						disabled={checkSent}
						onClick={() => sendCheck(gameId)}
					>
						Continue →
					</button>
				</div>
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
