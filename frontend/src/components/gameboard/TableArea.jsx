import { useIsMobileGame } from "../../hooks/useIsMobileGame"

const cardImages = import.meta.glob('../../assets/cards/Card_*.png', { eager: true })

const getCardImage = (value) => {
	const key = `../../assets/cards/Card_${value}.png`
	return cardImages[key]?.default
}

const LINKS = {
	1:	[6, 8],		2: [5, 9],	3: [4, 10],	4: [3, 11],
	5:	[2, 12],	6: [1],		7: [],		8: [1],
	9:	[2],		10: [3],	11: [4],	12: [5]
}

function TableArea({ riverSlots, isMyTurn, currentAction, cardsRevealed, onFlip, gameMode }) {
	const	isMobile = useIsMobileGame()
	const	actionsUsed = cardsRevealed.length
	const	expectedRevealed = { FIRST: 0, SECOND: 1, BONUS: 2 }
	const	canAct = isMyTurn && actionsUsed === expectedRevealed[currentAction]

	const	cols =	riverSlots.length === 9 ? 3
					: riverSlots.length === 8 ? 4
					: 3

	const cardSize = isMobile
		? "h-[4vw] w-[3vw] min-h-[44px] min-w-[32px]"
		: "h-[5.5vw] w-[4vw] min-h-[90px] min-w-[70px]"
	const cardBase = `${cardSize} rounded-md border border-white/20 bg-black transition-[transform,border,box-shadow] duration-200 ease-in-out`

	return (
		<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
			<div className={`grid ${isMobile ? 'gap-x-[14px] gap-y-[8px]' : 'gap-[50px]'}`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
				{riverSlots.map((card, index) => {
					if (!card) {
						return <div key={`empty-${index}`} className={`${cardBase} pointer-events-none invisible`} />
					}

					const	isRevealed = cardsRevealed.some(c => c.id === card.id)
					const	isClickable = canAct && !isRevealed

					return (
						<div
							key={card.id}
							className={`relative ${cardBase} overflow-hidden ${isRevealed ? 'flex cursor-default items-center justify-center font-bold' : ''} ${isClickable ? 'cursor-pointer hover:scale-[1.15] hover:border-[rgba(0,220,255,0.7)] hover:shadow-[0_0_12px_rgba(0,200,255,0.4)]' : ''}`}
							onClick={() => isClickable && onFlip(card.id)}
						>
							{isRevealed 
								? <img src={getCardImage(card.value)} alt={`Card ${card.value}`} className="h-full w-full rounded-md object-cover scale-[1.4] object-[center_-28%]"/> 
								: <img src={getCardImage("back")} className="h-full w-full rounded-md object-cover scale-[1.4] object-[center_-28%]" alt={`Card back`} />
							}
							{isRevealed && gameMode === 'LINKED' && (
								<>
									{LINKS[card.value]?.[0] != null && (
										<span className="absolute bottom-1 left-3 font-moonstrike text-[2rem] text-white leading-none pointer-event-none">
											{LINKS[card.value]?.[0]}
										</span>
									)}
									{LINKS[card.value]?.[1] != null && (
										<span className="absolute bottom-1 right-3 font-moonstrike text-[2rem] text-white leading-none pointer-event-none">
											{LINKS[card.value]?.[1]}
										</span>
									)}
								</>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default TableArea
