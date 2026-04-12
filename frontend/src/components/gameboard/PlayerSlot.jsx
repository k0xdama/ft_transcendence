import TrioBadge from "./TrioBadge"
import { useIsMobileGame } from "../../hooks/useIsMobileGame"

const cardImages = import.meta.glob('../../assets/cards/Card_*.png', { eager: true })

const getCardImage = (value) => {
	const key = `../../assets/cards/Card_${value}.png`
	return cardImages[key]?.default
}

const SEAT_DESKTOP = {
	top: "top-5 left-1/2 -translate-x-1/2",
	left: "left-[5vw] top-[calc(50%+var(--navbar-height)/2)] -translate-y-1/2",
	right: "right-[5vw] top-[calc(50%+var(--navbar-height)/2)] -translate-y-1/2",
	"top-left": "left-[22vw] top-[8vh]",
	"top-right": "right-[22vw] top-[8vh]",
	"bottom-left": "bottom-[8vh] left-[22vw]"
}

const SEAT_MOBILE = {
	top: "top-1 left-1/2 -translate-x-1/2",
	left: "left-[2vw] top-1/2 -translate-y-1/2",
	right: "right-[2vw] top-1/2 -translate-y-1/2",
	"top-left": "left-[10vw] top-[3vh]",
	"top-right": "right-[10vw] top-[3vh]",
	"bottom-left": "bottom-[3vh] left-[10vw]"
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
	const isMobile = useIsMobileGame()
	const isSideSeat = SIDE_SEATS.has(seat)
	const cardSize = isMobile
		? "h-[4vw] w-[3vw] min-h-[44px] min-w-[32px] rounded-md border border-white/20 bg-black"
		: "h-[5.5vw] w-[4vw] min-h-[90px] min-w-[70px] rounded-md border border-white/20 bg-black"
	const cardBackSeat = isSideSeat ? (isMobile ? "my-[-20px] rotate-90" : "my-[-17px] rotate-90") : ""
	const isBottomLeft = seat === 'bottom-left'
	const seatClass = (isMobile ? SEAT_MOBILE : SEAT_DESKTOP)[seat] ?? ""
	const revealedSeatClass = REVEALED_SEAT[seat] ?? ""

	return (
		<div
			className={`absolute flex flex-col items-center gap-[0.4rem] ${seatClass} ${isMyTurn && player.cardCount > 0 ? 'cursor-pointer' : ''} ${player.cardCount === 0 ? 'opacity-40 pointer-events-none' : ''}`}
			onClick={() => isMyTurn && onSelect(player.id)}
		>
			<span
				className={`whitespace-nowrap ${isMobile ? 'text-[0.55rem]' : 'text-[0.7rem]'} ${isSideSeat ? 'absolute -top-5 left-1/2 -translate-x-1/2' : ''} ${isCurrentPlayer ? 'animate-[pulse-name_1.5s_ease-in-out_infinite] text-[#00dcff] [text-shadow:0_0_10px_rgba(0,220,255,0.8)]' : ''}`}
			>
				{player.username ?? 'Opponent'}
			</span>
			<div className="flex items-center gap-2">
				<div className={`group/hand flex ${isMobile ? 'gap-1' : 'gap-2'} ${isSideSeat ? 'flex-col' : 'flex-row'}`}>
					{Array.from({ length: player.cardCount }).map((_, i) => (
						<div
							key={i}
							className={`${cardSize} ${cardBackSeat} ${isMyTurn ? 'group-hover/hand:border-[rgba(180,60,255,0.7)] group-hover/hand:shadow-[0_0_10px_rgba(140,40,200,0.4)]' : ''}`}
						/>
					))}
				</div>
				<TrioBadge trios={player.trios} />
			</div>
			{revealedHandCards.length > 0 && (
				<div className={`absolute flex gap-[0.4rem] ${revealedSeatClass}`}>
					{revealedHandCards.map(rc => (
						<div key={rc.cardId} className={`flex ${cardSize} items-center justify-center border-[rgba(180,60,255,0.6)] shadow-[0_0_10px_rgba(140,40,200,0.4)] ${isBottomLeft ? 'origin-bottom' : ''}`}>
							<img src={getCardImage(rc.value)} className="h-full w-full rounded-md object-contain" alt={`Card ${rc.value}`} />
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default PlayerSlot
