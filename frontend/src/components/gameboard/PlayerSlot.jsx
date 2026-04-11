import TrioBadge from "./TrioBadge"

const cardImages = import.meta.glob('../../assets/cards/Card_*.png', { eager: true })

const getCardImage = (value) => {
	const key = `../../assets/cards/Card_${value}.png`
	return cardImages[key]?.default
}

const SEAT_WRAPPER = {
	top: "top-5 left-1/2 -translate-x-1/2",
	left: "left-[5vw] top-[calc(50%+var(--navbar-height)/2)] -translate-y-1/2",
	right: "right-[5vw] top-[calc(50%+var(--navbar-height)/2)] -translate-y-1/2",
	"top-left": "left-[22vw] top-[8vh]",
	"top-right": "right-[22vw] top-[8vh]",
	"bottom-left": "bottom-[8vh] left-[22vw]"
}

const REVEALED_SEAT = {
	top: "top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 flex-row",
	left: "left-[calc(100%+3rem)] top-1/2 -translate-y-1/2 flex-col",
	right: "right-[calc(100%+3rem)] top-1/2 -translate-y-1/2 flex-col",
	"top-left": "top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 flex-row",
	"top-right": "top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 flex-row",
	"bottom-left": "bottom-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2 flex-row"
}

const SIDE_SEATS = new Set(["left", "right"])

function PlayerSlot({ player, seat, isCurrentPlayer, isMyTurn, revealedHandCards, onSelect, lastAction }) {
	void lastAction
	const isSideSeat = SIDE_SEATS.has(seat)
	const cardBackBase = "h-[5.5vw] min-h-[90px] w-[4vw] min-w-[70px] rounded-md border border-white/20 bg-black"
	const cardBackSeat = isSideSeat ? "my-[-17px] rotate-90" : ""
	const isBottomLeft = seat === 'bottom-left'
	const seatClass = SEAT_WRAPPER[seat] ?? ""
	const revealedSeatClass = REVEALED_SEAT[seat] ?? ""

	return (
		<div
			className={`absolute flex flex-col items-center gap-[0.4rem] ${seatClass} ${isMyTurn ? 'cursor-pointer' : ''}`}
			onClick={() => isMyTurn && onSelect(player.id)}
		>
			<span
				className={`whitespace-nowrap text-[0.7rem] ${isSideSeat ? 'absolute -top-5 left-1/2 -translate-x-1/2' : ''} ${isCurrentPlayer ? 'animate-[pulse-name_1.5s_ease-in-out_infinite] text-[#00dcff] [text-shadow:0_0_10px_rgba(0,220,255,0.8)]' : ''}`}
			>
				{player.username ?? 'Opponent'}
			</span>
			<div className="flex items-center gap-2">
				<div className={`group/hand flex gap-2 ${isSideSeat ? 'flex-col' : 'flex-row'}`}>
					{Array.from({ length: player.cardCount }).map((_, i) => (
						<div
							key={i}
							className={`${cardBackBase} ${cardBackSeat} ${isMyTurn ? 'group-hover/hand:border-[rgba(180,60,255,0.7)] group-hover/hand:shadow-[0_0_10px_rgba(140,40,200,0.4)]' : ''}`}
						/>
					))}
				</div>
				<TrioBadge trios={player.trios} />
			</div>
			{revealedHandCards.length > 0 && (
				<div className={`absolute flex gap-[0.4rem] ${revealedSeatClass}`}>
					{revealedHandCards.map(rc => (
						<div key={rc.cardId} className={`flex h-[5.5vw] min-h-[90px] w-[4vw] min-w-[70px] items-center justify-center rounded-md border border-[rgba(180,60,255,0.6)] bg-black shadow-[0_0_10px_rgba(140,40,200,0.4)] ${isBottomLeft ? 'origin-bottom' : ''}`}>
							<img src={getCardImage(rc.value)} className="h-full w-full rounded-md object-contain" alt={`Card ${rc.value}`} />
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default PlayerSlot
