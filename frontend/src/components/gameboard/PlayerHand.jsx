import TrioBadge from "./TrioBadge"
import { useIsMobileGame } from "../../hooks/useIsMobileGame"
import { HAND_DESKTOP, HAND_MOBILE } from "../../constants/GameConstants"
import GameCard from "./GameCard"

function PlayerHand({ cards, seat, trios, isMyTurn, onSelectSelf, gameMode }) {
	const isMobile = useIsMobileGame()
	const seatClass = (isMobile ? HAND_MOBILE : HAND_DESKTOP)[seat] ?? ""
	const isBottomLeft = seat === 'bottom-left'
	const canSelectHand = isMyTurn && cards.length > 0

	return (
		<div
			className={`absolute flex items-center gap-3 ${seatClass} ${canSelectHand ? 'cursor-pointer' : ''}`}
			onClick={() => canSelectHand && onSelectSelf()}
		>
			{isMyTurn && (
				<span className={`absolute -top-[22px] left-1/2 -translate-x-1/2 whitespace-nowrap tracking-[0.2em] text-cyan-glow [text-shadow:0_0_8px_rgba(0,220,255,0.8)] cursor-pointer ${isMobile ? 'text-[0.5rem]' : 'text-[0.65rem]'}`}>
					YOUR TURN
				</span>
			)}
			<div
				className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'} ${isMyTurn ? 'animate-[pulse-hand_1.5s_ease-in-out_infinite]' : ''}`}
				style={isMyTurn ? { filter: 'drop-shadow(0 0 14px rgba(0, 200, 255, 0.7))' } : undefined}
			>
				{cards.map(card => (
					<GameCard
						key={card.id}
						value={card.value}
						gameMode={gameMode}
						origin={isBottomLeft ? 'origin-bottom' : ''}
					/>
				))}
				<TrioBadge trios={trios} gameMode={gameMode} seat={seat}/>
			</div>
		</div>
	)
}

export default PlayerHand