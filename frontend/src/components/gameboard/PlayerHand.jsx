import TrioBadge from "./TrioBadge"
import { useIsMobileGame } from "../../hooks/useIsMobileGame"

const	cardImages = import.meta.glob('../../assets/cards/Card_*.png', { eager: true })

const	getCardImage = (label) => {
	const key = `../../assets/cards/Card_${label}.png`

	return cardImages[key]?.default
}

const HAND_DESKTOP = {
	"bottom-center": "bottom-[2vh] left-1/2 -translate-x-1/2",
	"bottom-right": "bottom-[8vh] right-[22vw]"
}

const HAND_MOBILE = {
	"bottom-center": "bottom-[6vh] left-1/2 -translate-x-1/2",
	"bottom-right": "bottom-[6vh] right-[10vw]"
}

function PlayerHand({ cards, seat, trios, isMyTurn, onSelectSelf }) {
	const isMobile = useIsMobileGame()
	const seatClass = (isMobile ? HAND_MOBILE : HAND_DESKTOP)[seat] ?? ""
	const isBottomLeft = seat === 'bottom-left'
	const cardSize = isMobile
		? "h-[4vw] w-[3vw] min-h-[44px] min-w-[32px]"
		: "h-[5.5vw] w-[4vw] min-h-[90px] min-w-[70px]"

	return (
		<div
			className={`absolute flex items-center gap-3 ${seatClass} ${isMyTurn ? 'cursor-pointer' : ''}`}
			onClick={() => isMyTurn && onSelectSelf()}
		>
			{isMyTurn && (
				<span className={`absolute -top-[22px] left-1/2 -translate-x-1/2 whitespace-nowrap tracking-[0.2em] text-[#00dcff] [text-shadow:0_0_8px_rgba(0,220,255,0.8)] ${isMobile ? 'text-[0.5rem]' : 'text-[0.65rem]'}`}>
					YOUR TURN
				</span>
			)}
			<div
				className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'} ${isMyTurn ? 'animate-[pulse-hand_1.5s_ease-in-out_infinite]' : ''}`}
				style={isMyTurn ? { filter: 'drop-shadow(0 0 14px rgba(0, 200, 255, 0.7))' } : undefined}
			>
				{cards.map(card => (
					<div key={card.id} className={`flex overflow-hidden ${cardSize} items-center justify-center rounded-md border border-white/20 bg-black font-bold ${isBottomLeft ? 'origin-bottom' : ''}`}>
						<img
							src={getCardImage(card.value)}
							alt={`Card ${card.value}`}
							className="h-full w-full rounded-md object-cover scale-[1.4] object-[center_-28%]"
						/>
					</div>
				))}
				<TrioBadge trios={trios} />
			</div>
		</div>
	)
}

export default PlayerHand
