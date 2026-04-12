import { useIsMobileGame } from "../../hooks/useIsMobileGame"

const cardImages = import.meta.glob('../../assets/cards/Card_*.png', { eager: true })

const getCardImage = (value) => {
	const key = `../../assets/cards/Card_${value}.png`
	return cardImages[key]?.default
}

function TableArea({ riverSlots, isMyTurn, currentAction, cardsRevealed, onFlip }) {
	const isMobile = useIsMobileGame()
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
							className={`${cardBase} ${isRevealed ? 'flex cursor-default items-center justify-center font-bold' : ''} ${isClickable ? 'cursor-pointer hover:scale-[1.15] hover:border-[rgba(0,220,255,0.7)] hover:shadow-[0_0_12px_rgba(0,200,255,0.4)]' : ''}`}
							onClick={() => isClickable && onFlip(card.id)}
						>
							{isRevealed && <img src={getCardImage(card.value)} alt={`Card ${card.value}`} className="h-full w-full rounded-md object-contain"/>}
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default TableArea
