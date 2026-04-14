import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useGame } from "../../context/GameContext"
import { useLobby } from '../../context/LobbyContext'
import { useAuth } from '../../context/AuthContext'
import { useIsMobileGame } from '../../hooks/useIsMobileGame'
import { useEffect, useState } from 'react'
import PlayerHand from './PlayerHand'
import PlayerSlot from './PlayerSlot'
import TableArea from './TableArea'
import ChatOverlay from './ChatOverlay'
import SoundBuzzers from './SoundBuzzers'
import './GameView.css'
import CountdownRing from './CountdownRing'
import boardBackdrop from '../../assets/Board_backdrop.png'
import GameCard from './GameCard'
import { LAYOUTS } from '../../constants/GameConstants'

const	playerActionBtn = 'cursor-pointer rounded-lg border border-game-cyan/50 bg-game-cyan-soft/[0.08] px-7 py-3 text-[0.75rem] uppercase tracking-[0.1em] text-cyan-glow transition-[background,box-shadow] duration-200 hover:bg-game-cyan-soft/[0.18] hover:shadow-[0_0_16px_rgba(0,200,255,0.35)]';

function GameView() {
	const { gameId } = useParams()
	const { state } = useLocation()
	const lobbyId = state?.lobbyId || gameId
	const { gameStruct, connect, disconnect, sendAction, sendCheck, pendingCheck, lastAction, turnTimer, disconnectedPlayer, riverSlots, revealedHandCards, gameResult } = useGame()
	const { leaveLobby } = useLobby()
	const { user } = useAuth()
	const [selectedOpponent, setSelectedOpponent] = useState(null)
	const [checkSent, setCheckSent] = useState(false)
	const [showQuitConfirm, setShowQuitConfirm] = useState(false)
	const [showGameMenu, setShowGameMenu] = useState(false)
	const [showRotateHint, setShowRotateHint] = useState(false)
	const isMobile = useIsMobileGame()
	const navigate = useNavigate()

	useEffect(() => {
		console.log('GameView mounted - gameId:', gameId);
		document.body.classList.add('gameboard-active')

		// Hide all navbars (mobile + desktop) and footer during game
		const isMobileScreen = window.innerWidth < 768 || window.innerHeight < 500
		const mobileBar = document.querySelectorAll('.md\\:hidden')
		const desktopNav = document.querySelector('nav')
		const footer = document.querySelector('footer')
		if (isMobileScreen) {
			mobileBar.forEach(el => { if (el.closest && !el.closest('[class*="gameboard"]')) el.style.display = 'none' })
			if (desktopNav)
				desktopNav.style.display = 'none'
		}
		if (footer)
			footer.style.display = 'none'

		// Show rotate hint when portrait on mobile
		const checkOrientation = () => {
			const isPortrait = window.innerHeight > window.innerWidth && window.innerWidth < 768
			setShowRotateHint(isPortrait)
		}
		checkOrientation()
		window.addEventListener('resize', checkOrientation)

		connect(gameId)
		return () => {
			document.body.classList.remove('gameboard-active')
			mobileBar.forEach(el => { el.style.display = '' })
			if (desktopNav)
				desktopNav.style.display = ''
			if (footer)
				footer.style.display = ''
			window.removeEventListener('resize', checkOrientation)

			leaveLobby()
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
	if (me === undefined)
		return;
	const opponents = gameStruct.players.filter(p => p.id !== user?.id)
	const isMyTurn = gameStruct?.currentPlayer === user?.id
	const layout = LAYOUTS[gameStruct.players.length]
	const river = gameStruct.cardsInMiddle
	const currentAction = gameStruct.currentAction
	const expectedRevealed = { FIRST: 0, SECOND: 1, BONUS: 2 }
	const myRevCards = revealedHandCards.filter(c => c.ownerId === me.id)
	const canAct = isMyTurn && gameStruct.cardsRevealed.length === expectedRevealed[currentAction]
	const mode = gameStruct.gameMode

	return (
		<div className={`relative w-screen overflow-hidden ${isMobile ? 'h-screen' : 'h-[calc(100vh-var(--navbar-height))]'}`}>
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
						username: player.username,
						cardCount: player.hand.length,
						trios: gameStruct.trioWonArray[player.id] ?? []
					}}
					seat={layout.seats[index]}
					isCurrentPlayer={gameStruct.currentPlayer === player.id}
					isMyTurn={canAct}
					revealedHandCards={revealedHandCards.filter(c => c.ownerId === player.id)}
					onSelect={(opponentId) => {
						const target = gameStruct.players.find(player => player.id === opponentId);
						if (target && target.hand.length > 0)
							setSelectedOpponent(opponentId);
					}}
					lastAction={lastAction}
					gameMode={mode}
				/>
			))}

			<TableArea
				riverSlots={riverSlots ?? river}
				isMyTurn={isMyTurn}
				currentAction={currentAction}
				cardsRevealed={gameStruct.cardsRevealed}
				onFlip={(cardId) => sendAction(gameId, 'FLIP_MIDDLE', cardId)}
				gameMode={mode}
			/>

			{myRevCards.length > 0 && (
				<div className={`absolute z-[5] flex gap-2 ${layout.playerSeat === 'bottom-center'
					? `left-1/2 -translate-x-1/2 ${isMobile ? 'bottom-[calc(6vh+50px)]' : 'bottom-[calc(2vh+150px)]'}`
					: `${isMobile ? 'bottom-[calc(6vh+50px)] right-[10vw]' : 'bottom-[calc(8vh+150px)] right-[22vw]'}`
				}`}>
					{myRevCards.map(rc => (
						<GameCard
							key={rc.cardId}
							value={rc.value}
							gameMode={mode}
							className="border-[rgba(180,60,255,0.6)] shadow-[0_0_10px_rgba(140,40,200,0.4)]"
						/>
					))}
				</div>
			)}

			<PlayerHand
				cards={me.hand}
				seat={layout.playerSeat}
				trios={gameStruct.trioWonArray[me.id] ?? []}
				isMyTurn={canAct}
				onSelectSelf={() => setSelectedOpponent(me.id)}
				gameMode={mode}
			/>

			<ChatOverlay lobbyId={lobbyId} />
			<SoundBuzzers lobbyId={lobbyId} />

			{/* Mobile: hamburger menu button */}
			{isMobile && (
				<button
					className="absolute top-3 right-3 z-30 flex h-9 w-9 flex-col items-center justify-center gap-[4px] rounded-lg border border-purple-dim bg-[rgba(10,5,20,0.85)] p-0 transition-all hover:border-purple-mid"
					onClick={() => setShowGameMenu(true)}
					aria-label="Game menu"
				>
					<span className="block h-[2px] w-4 rounded-full bg-purple-pale"></span>
					<span className="block h-[2px] w-4 rounded-full bg-purple-pale"></span>
					<span className="block h-[2px] w-4 rounded-full bg-purple-pale"></span>
				</button>
			)}

			{/* Mobile: game menu sidebar */}
			{showGameMenu && isMobile && (
				<div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm" onClick={() => setShowGameMenu(false)}>
					<div
						className="absolute right-0 top-0 flex h-full w-[220px] max-w-[70vw] flex-col bg-game-panel/95 shadow-[-8px_0_40px_rgba(0,0,0,0.5)] animate-slide-in-right"
						onClick={e => e.stopPropagation()}
					>
						<div className="flex justify-end p-3">
							<button
								className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-transparent p-0 text-xs text-white/80 transition-colors hover:border-purple-mid hover:text-white"
								onClick={() => setShowGameMenu(false)}
							>
								✕
							</button>
						</div>

						<div className="flex flex-col items-center gap-2 border-b border-purple-dim px-4 pb-4">
							<span className="text-sm uppercase tracking-ui text-purple-pale">{user?.username}</span>
						</div>

						<nav className="flex flex-1 flex-col gap-1 px-3 py-4">
							<button
								className="flex w-full items-center gap-3 rounded-lg border-0 bg-transparent px-3 py-2.5 text-left text-[0.75rem] uppercase tracking-ui text-red-400 transition-all hover:bg-red-500/10"
								onClick={() => { setShowGameMenu(false); setShowQuitConfirm(true) }}
							>
								Leave Game
							</button>
						</nav>
					</div>
				</div>
			)}

			{/* Mobile: quit confirm overlay */}
			{showQuitConfirm && isMobile && (
				<div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-[4px]" onClick={() => setShowQuitConfirm(false)}>
					<div className="flex flex-col items-center gap-4 rounded-2xl border border-game-purple/40 bg-game-panel/95 px-8 py-6 shadow-[0_0_40px_rgba(140,40,200,0.3)]" onClick={e => e.stopPropagation()}>
						<p className="m-0 text-[0.85rem] uppercase tracking-[0.15em] text-purple-pale [text-shadow:0_0_10px_rgba(180,80,255,0.6)]">Leave the game?</p>
						<div className="flex gap-3">
							<button
								className="cursor-pointer rounded-lg border border-red-500/50 bg-red-500/10 px-6 py-2.5 text-[0.75rem] uppercase tracking-[0.1em] text-red-400 transition-all hover:bg-red-500/25"
								onClick={() => navigate('/')}
							>
								Quit
							</button>
							<button
								className="cursor-pointer rounded-lg border border-purple-dim bg-transparent px-6 py-2.5 text-[0.75rem] uppercase tracking-[0.1em] text-white/60 transition-all hover:border-purple-mid hover:text-white/80"
								onClick={() => setShowQuitConfirm(false)}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}

			{pendingCheck && (
			<div className={`absolute z-40 -translate-x-1/2 ${gameStruct.players.length >= 5 ? 'left-1/2' : 'left-[40%]'} ${isMobile ? 'bottom-[calc(6vh+50px)]' : 'bottom-[calc(2vh+150px)]'}`}>
					<button
						className={`cursor-pointer rounded-lg border border-game-cyan/50 bg-game-cyan-soft/10 px-9 py-3 text-[0.8rem] uppercase tracking-[0.15em] text-cyan-glow ${checkSent ? 'cursor-not-allowed opacity-45 shadow-none' : 'animate-[pulse-check_1.2s_ease-in-out_infinite]'}`}
						disabled={checkSent}
						onClick={() => sendCheck(gameId)}
					>
						Continue →
					</button>
				</div>
			)}

			{turnTimer && (
				<div className={`absolute z-10 ${isMobile ? 'bottom-[calc(6vh+50px)] right-[15vw]' : `${gameStruct.players.length >= 5 ? 'left-1/2' : 'left-[40%]'} -translate-x-1/2 bottom-[calc(2vh+220px)]`}`}>
					<CountdownRing duration={7} label="next turn" />
				</div>
			)}

			{disconnectedPlayer && (
				<div className={`absolute z-10 ${isMobile ? 'right-12 top-3' : 'right-5 top-5'}`}>
					<CountdownRing duration={30} color="#ff6b6b" label="player disconnected" />
				</div>
			)}

			{selectedOpponent && (
				<div className='absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[4px]' onClick={() => setSelectedOpponent(null)}>
					<div className='flex flex-col items-center gap-4 rounded-2xl border border-game-purple/40 bg-game-panel/90 px-6 py-5 shadow-[0_0_40px_rgba(140,40,200,0.3)] md:gap-5 md:px-10 md:py-8' onClick={e => e.stopPropagation()}>
						<p className='m-0 text-[0.75rem] uppercase tracking-[0.15em] text-purple-pale [text-shadow:0_0_10px_rgba(180,80,255,0.6)] md:text-[0.85rem]'>Choose an action</p>
						<div className='flex gap-3 md:gap-4'>
							<button className={playerActionBtn} onClick={() => handleOpponentAction('PLAYER_LOWEST')}>
								Lowest card
							</button>
							<button className={playerActionBtn} onClick={() => handleOpponentAction('PLAYER_HIGHEST')}>
								Highest card
							</button>
						</div>
						<button className='cursor-pointer border-none bg-transparent text-[0.7rem] uppercase tracking-[0.1em] text-game-purple-soft/40 transition-colors duration-200 hover:text-game-purple-soft/80' onClick={() => setSelectedOpponent(null)}>Cancel</button>
					</div>
				</div>
			)}
				{gameResult && (
					<div className="fixed inset-0 z-[100] flex animate-[fade-in_0.6s_ease_forwards] items-center justify-center bg-black/75 backdrop-blur-[6px]">
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
								<p className="m-0 text-[0.9rem] uppercase tracking-[0.2em] text-game-purple-soft/70">Opponent forfeited</p>
							)}
							<button className='mt-2 cursor-pointer rounded-lg border border-game-cyan/50 bg-game-cyan-soft/[0.08] px-9 py-3 text-[0.8rem] uppercase tracking-[0.15em] text-cyan-glow transition-[background,box-shadow] duration-200 hover:bg-game-cyan-soft/[0.18] hover:shadow-[0_0_20px_rgba(0,200,255,0.35)]' onClick={() => navigate('/')}>
								Back to home
							</button>
						</div>
					</div>
				)}
			</div>

			{/* Rotate hint overlay — shown on mobile portrait when orientation lock failed */}
			{showRotateHint && (
				<div className="fixed inset-0 z-[300] flex flex-col items-center justify-center gap-6 bg-game-panel/95 backdrop-blur-md">
					<span className="text-[4rem] animate-[rotate-phone_1.5s_ease-in-out_infinite]">📱</span>
					<p className="m-0 text-center text-[0.9rem] uppercase tracking-[0.2em] text-purple-pale [text-shadow:0_0_12px_rgba(180,80,255,0.6)]">
						Rotate your device
					</p>
					<p className="m-0 text-center text-[0.7rem] tracking-[0.1em] text-white/40">
						This game is best played in landscape mode
					</p>
				</div>
			)}
		</div>
	)
}

export default GameView
