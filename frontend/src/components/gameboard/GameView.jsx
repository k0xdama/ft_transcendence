import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useGame } from "../../context/GameContext"
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'
import PlayerHand from './PlayerHand'
import PlayerSlot from './PlayerSlot'
import TableArea from './TableArea'
import ChatOverlay from './ChatOverlay'
import SoundBuzzers from './SoundBuzzers'
import './GameView.css'
import CountdownRing from './CountdownRing'
import boardBackdrop from '../../assets/Board_backdrop.png'

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
	const { gameStruct, connect, disconnect, sendAction, sendCheck, pendingCheck, lastAction, turnTimer, disconnectedPlayer, riverSlots, revealedHandCards, gameResult } = useGame()
	const { user } = useAuth()
	const [selectedOpponent, setSelectedOpponent] = useState(null)
	const [checkSent, setCheckSent] = useState(false)
	const navigate = useNavigate()

	useEffect(() => {
		console.log('GameView mounted - gameId:', gameId);
		document.body.classList.add('gameboard-active')
		connect(gameId)
		return () => {
			document.body.classList.remove('gameboard-active')
			disconnect()
		}
	}, [])

	useEffect(() => {
		if (!pendingCheck)
			setCheckSent(false)
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
	const myRevCards = revealedHandCards.filter(c => c.ownerId === me.id)
	const canAct = isMyTurn && gameStruct.cardsRevealed.length === expectedRevealed[currentAction]

	return (
		<div className='relative h-[calc(100vh-var(--navbar-height))] w-screen overflow-hidden'>
			<div
				className="pointer-events-none fixed inset-0 z-0 h-full w-full bg-cover bg-center brightness-[0.8] blur-[2px]"
				style={{ backgroundImage: `url(${boardBackdrop})` }}
			/>
			<div className="relative z-10 h-full w-full">
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

			{myRevCards.length > 0 && (
				<div className={`absolute z-[5] flex gap-2 ${layout.playerSeat === 'bottom-center' ? 'bottom-[calc(2vh+150px)] left-1/2 -translate-x-1/2' : 'bottom-[calc(8vh+150px)] right-[22vw]'}`}>
					{myRevCards.map(rc => (
						<div key={rc.cardId} className="flex h-[5.5vw] min-h-[90px] w-[4vw] min-w-[70px] items-center justify-center rounded-md border border-[rgba(180,60,255,0.6)] bg-black font-bold shadow-[0_0_10px_rgba(140,40,200,0.4)]">
							<img src={getCardImage(rc.value)} className="h-full w-full rounded-md object-contain" alt={`Card ${rc.value}`} />
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

			<ChatOverlay lobbyId={lobbyId} />
			<SoundBuzzers lobbyId={lobbyId} />

			{pendingCheck && (
				<div className="absolute bottom-[calc(2vh+150px)] left-1/2 z-40 -translate-x-1/2">
					<button
						className={`cursor-pointer rounded-lg border border-[rgba(0,220,255,0.5)] bg-[rgba(0,200,255,0.1)] px-9 py-3 text-[0.8rem] uppercase tracking-[0.15em] text-[#00dcff] ${checkSent ? 'cursor-not-allowed opacity-45 shadow-none' : 'animate-[pulse-check_1.2s_ease-in-out_infinite]'}`}
						disabled={checkSent}
						onClick={() => sendCheck(gameId)}
					>
						Continue →
					</button>
				</div>
			)}

			{turnTimer && (
				<div className='absolute bottom-0 right-1/4 z-10 -translate-x-1/2 translate-y-[calc(-50%-120px)]'>
					<CountdownRing duration={7} label="next turn" />
				</div>
			)}

			{disconnectedPlayer && (
				<div className='absolute right-5 top-5 z-10'>
					<CountdownRing duration={30} color="#ff6b6b" label="player disconnected" />
				</div>
			)}

			{selectedOpponent && (
				<div className='absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[4px]' onClick={() => setSelectedOpponent(null)}>
					<div className='flex flex-col items-center gap-5 rounded-2xl border border-[rgba(180,60,255,0.4)] bg-[rgba(10,5,20,0.9)] px-10 py-8 shadow-[0_0_40px_rgba(140,40,200,0.3)]' onClick={e => e.stopPropagation()}>
						<p className='m-0 text-[0.85rem] uppercase tracking-[0.15em] text-[#e0aaff] [text-shadow:0_0_10px_rgba(180,80,255,0.6)]'>Choose an action</p>
						<div className='flex gap-4'>
							<button className='cursor-pointer rounded-lg border border-[rgba(0,220,255,0.5)] bg-[rgba(0,200,255,0.08)] px-7 py-3 text-[0.75rem] uppercase tracking-[0.1em] text-[#00dcff] transition-[background,box-shadow] duration-200 hover:bg-[rgba(0,200,255,0.18)] hover:shadow-[0_0_16px_rgba(0,200,255,0.35)]' onClick={() => handleOpponentAction('PLAYER_HIGHEST')}>
								Highest card
							</button>
							<button className='cursor-pointer rounded-lg border border-[rgba(0,220,255,0.5)] bg-[rgba(0,200,255,0.08)] px-7 py-3 text-[0.75rem] uppercase tracking-[0.1em] text-[#00dcff] transition-[background,box-shadow] duration-200 hover:bg-[rgba(0,200,255,0.18)] hover:shadow-[0_0_16px_rgba(0,200,255,0.35)]' onClick={() => handleOpponentAction('PLAYER_LOWEST')}>
								Lowest card
							</button>
						</div>
						<button className='cursor-pointer border-none bg-transparent text-[0.7rem] uppercase tracking-[0.1em] text-[rgba(200,160,255,0.4)] transition-colors duration-200 hover:text-[rgba(200,160,255,0.8)]' onClick={() => setSelectedOpponent(null)}>Cancel</button>
					</div>
				</div>
			)}
				{gameResult && (
					<div className="absolute inset-0 z-[100] flex animate-[fade-in_0.6s_ease_forwards] items-center justify-center bg-black/75 backdrop-blur-[6px]">
						<div
							className="flex flex-col items-center gap-4"
							style={{
								'--game-over-color': gameResult.winnerId === user?.id ? '#00dcff' : '#ff4466',
								'--game-over-glow':  gameResult.winnerId === user?.id ? 'rgba(0,220,255,0.6)' : 'rgba(255,60,80,0.6)'
							}}
						>
							<p className="m-0 text-[clamp(3rem,8vw,6rem)] font-bold uppercase tracking-[0.1em] text-[var(--game-over-color)] [text-shadow:0_0_30px_var(--game-over-glow),0_0_60px_var(--game-over-glow)] animate-[pulse-result_2s_ease-in-out_infinite]">
								{gameResult.winnerId === user?.id ? 'You win!' : 'You lose!'}
							</p>
							{gameResult.reason === 'FORFEIT' && (
								<p className="m-0 text-[0.9rem] uppercase tracking-[0.2em] text-[rgba(200,160,255,0.7)]">Opponent forfeited</p>
							)}
							<button className='mt-2 cursor-pointer rounded-lg border border-[rgba(0,220,255,0.5)] bg-[rgba(0,200,255,0.08)] px-9 py-3 text-[0.8rem] uppercase tracking-[0.15em] text-[#00dcff] transition-[background,box-shadow] duration-200 hover:bg-[rgba(0,200,255,0.18)] hover:shadow-[0_0_20px_rgba(0,200,255,0.35)]' onClick={() => navigate('/')}>
								Back to home
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

export default GameView
