import TrioBadge from "./TrioBadge"
import { useIsMobileGame } from "../../hooks/useIsMobileGame"
import { SEAT_DESKTOP, SEAT_MOBILE, REVEALED_SEAT } from "../../constants/GameConstants"
import GameCard from "./GameCard"

const SIDE_SEATS = new Set(["left", "right"])

function PlayerSlot({ player, seat, isCurrentPlayer, isMyTurn, revealedHandCards, onSelect, lastAction, gameMode }) {
	void lastAction
	const isMobile = useIsMobileGame()
	const isSideSeat = SIDE_SEATS.has(seat)
	const cardBackSeat = isSideSeat
		? (isMobile ? "my-[-20px] rotate-90" : "my-[-17px] rotate-90")
		: ""
	const hoverClass = isMyTurn
		? 'group-hover/hand:border-game-purple/70 group-hover/hand:shadow-[0_0_10px_rgba(140,40,200,0.4)]'
		: ''
	const isBottomLeft = seat === 'bottom-left'
	const seatClass = (isMobile ? SEAT_MOBILE : SEAT_DESKTOP)[seat] ?? ""
	const revealedSeatClass = REVEALED_SEAT[seat] ?? ""
	const canSelectHand = isMyTurn && player.cardCount > 0

	return (
		<div
			className={`absolute flex flex-col items-center gap-[0.4rem] ${seatClass} ${canSelectHand ? 'cursor-pointer' : ''}`}
			onClick={() => canSelectHand && onSelect(player.id)}
		>
			<span
				className={`whitespace-nowrap ${isMobile ? 'text-[0.55rem]' : 'text-[1rem]'} ${isSideSeat ? 'absolute -top-5 left-1/2 -translate-x-1/2' : ''} ${isCurrentPlayer ? 'animate-[pulse-name_1.5s_ease-in-out_infinite] text-cyan-glow [text-shadow:0_0_10px_rgba(0,220,255,0.8)]' : ''} ${player.cardCount === 0 ? 'opacity-40' : ''}`}
			>
				{player.username ?? 'Opponent'}
			</span>
			<div className={`flex items-center gap-2`}>
				<div className={`group/hand flex ${isMobile ? 'gap-1' : 'gap-2'} ${isSideSeat ? 'flex-col' : 'flex-row'} ${player.cardCount === 0 ? 'opacity-40' : ''}`}>
					{Array.from({ length: player.cardCount }).map((_, i) => (
						<GameCard
							key={i}
							value="back"
							className={`${cardBackSeat} ${hoverClass}`}
						/>
					))}
				</div>
				<TrioBadge trios={player.trios} gameMode={gameMode}/>
			</div>
			{revealedHandCards.length > 0 && (
				<div className={`absolute flex gap-[0.4rem] ${revealedSeatClass}`}>
					{revealedHandCards.map(rc => (
						<GameCard
							key={rc.cardId}
							value={rc.value}
							gameMode={gameMode}
							origin={isBottomLeft ? 'origin-bottom' : ''}
							className="border-game-purple/60 shadow-[0_0_10px_rgba(140,40,200,0.4)]"
						/>
					))}
				</div>
			)}
		</div>
	)
}

export default PlayerSlot
