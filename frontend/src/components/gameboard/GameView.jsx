import { useParams, useLocation } from 'react-router-dom'
import { useGame } from "../../context/GameContext"
import { useAuth } from '../../context/AuthContext'
import { useEffect, useRef, useState } from 'react'
import PlayerHand from './PlayerHand'
import PlayerSlot from './PlayerSlot'
import TableArea from './TableArea'
import ChatOverlay from './ChatOverlay'
import SoundBuzzers from './SoundBuzzers'
import './GameView.css'
import CountdownRing from './CountdownRing'

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

const	cardImages = import.meta.glob('../../assets/cards/Card_*.png', { eager: true })

const	getCardImage = (label) => {
	const	key = `../../assets/cards/Card_${label}.png`
	return	cardImages[key]?.default
}

function GameView() {
	const { gameId } = useParams()
	const { state } = useLocation()
	const lobbyId = state?.lobbyId || gameId
	const { gameStruct, connect, sendAction, sendCheck, pendingCheck, lastAction, turnTimer, disconnectedPlayer, riverSlots, revealedHandCards, gameResult } = useGame()
	const { user } = useAuth()
	const [selectedOpponent, setSelectedOpponent] = useState(null)
	const [checkSent, setCheckSent] = useState(false)
	const chatSocketRef = useRef(null)

	useEffect(() => {
		document.body.classList.add('gameboard-active')
		connect(gameId)
		return () => document.body.classList.remove('gameboard-active')
	}, [])

	useEffect(() => {
		if (!pendingCheck) setCheckSent(false)
	}, [pendingCheck])

	const handleOpponentAction = (actionType) => {
		sendAction(gameId, actionType, selectedOpponent)
		setSelectedOpponent(null)
	}

	if (!gameStruct)
		return <p>Waiting for all players to connect...</p>

	const me = gameStruct.players.find(p => p.id === user?.id)
	const opponents = gameStruct.players.filter(p => p.id !== user?.id)
	const isMyTurn = gameStruct?.currentPlayer === user?.id
	const layout = LAYOUTS[gameStruct.players.length]
	const river = gameStruct.cardsInMiddle
	const currentAction = gameStruct.currentAction
	const expectedRevealed = { FIRST: 0, SECOND: 1, BONUS: 2 }
	const canAct = isMyTurn && gameStruct.cardsRevealed.length === expectedRevealed[currentAction]

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
					revealedHandCards={revealedHandCards.filter(c => c.ownerId === player.id)}
					onSelect={(opponentId) => setSelectedOpponent(opponentId)}
					lastAction={lastAction}
				/>
			))}

			<TableArea
				riverSlots={riverSlots ?? river}
				isMyTurn={isMyTurn}
				currentAction={currentAction}
				cardsRevealed={gameStruct.cardsRevealed}
				onFlip={(cardId) => sendAction(gameId, 'FLIP_MIDDLE', cardId)}
			/>

			{revealedHandCards.filter(c => c.ownerId === me.id).length > 0 && (
				<div className={`revealed-hand-cards self-revealed-${layout.playerSeat}`}>
					{revealedHandCards.map(rc => (
						<div key={rc.cardId} className="card card-front revealed-card">
							<img src={getCardImage(rc.value)} className="card-img" alt={`Card ${rc.value}`} />
						</div>
					))}
				</div>
			)}

			<PlayerHand
				cards={me.hand}
				seat={layout.playerSeat}
				trios={gameStruct.trioWonArray[me.id] ?? []}
				isMyTurn={canAct}
				onSelectSelf={() => setSelectedOpponent(me.id)}
			/>

			<ChatOverlay socketRef={chatSocketRef} lobbyId={lobbyId} />
			<SoundBuzzers socketRef={chatSocketRef} lobbyId={lobbyId} />

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

			{turnTimer && (
				<div className='turn-timer-ring'>
					<CountdownRing duration={7} label="next turn" />
				</div>
			)}

			{disconnectedPlayer && (
				<div className='disconnect-timer-ring'>
					<CountdownRing duration={30} color="#ff6b6b" label="player disconnected" />
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
				{gameResult && (
					<div className="game-over-overlay">
						<div
							className="game-over-content"
							style={{
								'--game-over-color': gameResult.winnerId === user?.id ? '#00dcff' : '#ff4466',
								'--game-over-glow':  gameResult.winnerId === user?.id ? 'rgba(0,220,255,0.6)' : 'rgba(255,60,80,0.6)'
							}}
						>
							<p className="game-over-text">
								{gameResult.winnerId === user?.id ? 'You win!' : 'You lose!'}
							</p>
							{gameResult.reason === 'FORFEIT' && (
								<p className="game-over-reason">Opponent forfeited</p>
							)}
							<p className="game-over-sub">Post-game screen coming soon...</p>
						</div>
					</div>
				)}
		</div>
	)
}

export default GameView
