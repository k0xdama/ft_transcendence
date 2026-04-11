import TrioBadge from "./TrioBadge"

const	cardImages = import.meta.glob('../../assets/cards/Card_*.png', { eager: true })

const	getCardImage = (label) => {
	const key = `../../assets/cards/Card_${label}.png`

	return cardImages[key]?.default
}

const HAND_SEAT = {
	"bottom-center": "bottom-[2vh] left-1/2 -translate-x-1/2",
	"bottom-right": "bottom-[8vh] right-[22vw]"
}

function PlayerHand({ cards, seat, trios, isMyTurn, onSelectSelf }) {
	const seatClass = HAND_SEAT[seat] ?? ""
	const isBottomLeft = seat === 'bottom-left'
	return (
		<div
			className={`absolute flex items-center gap-3 ${seatClass} ${isMyTurn ? 'cursor-pointer' : ''}`}
			onClick={() => isMyTurn && onSelectSelf()}
		>
			{isMyTurn && (
				<span className="absolute -top-[22px] left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.65rem] tracking-[0.2em] text-[#00dcff] [text-shadow:0_0_8px_rgba(0,220,255,0.8)]">
					YOUR TURN
				</span>
			)}
			<div
				className={`flex items-center gap-2 ${isMyTurn ? 'animate-[pulse-hand_1.5s_ease-in-out_infinite]' : ''}`}
				style={isMyTurn ? { filter: 'drop-shadow(0 0 14px rgba(0, 200, 255, 0.7))' } : undefined}
			>
				{cards.map(card => (
					<div key={card.id} className={`flex h-[5.5vw] min-h-[90px] w-[4vw] min-w-[70px] items-center justify-center rounded-md border border-white/20 bg-black font-bold ${isBottomLeft ? 'origin-bottom' : ''}`}>
						<img
							src={getCardImage(card.value)}
							alt={`Card ${card.value}`}
							className="h-full w-full rounded-md object-contain"
						/>
					</div>
				))}
				<TrioBadge trios={trios} />
			</div>
		</div>
	)
}

export default PlayerHand
