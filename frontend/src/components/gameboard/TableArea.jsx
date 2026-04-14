import { useIsMobileGame } from "../../hooks/useIsMobileGame"
import GameCard from "./GameCard"

function TableArea({ riverSlots, isMyTurn, currentAction, cardsRevealed, onFlip, gameMode }) {
	const	isMobile = useIsMobileGame()
	const	actionsUsed = cardsRevealed.length
	const	expectedRevealed = { FIRST: 0, SECOND: 1, BONUS: 2 }
	const	canAct = isMyTurn && actionsUsed === expectedRevealed[currentAction]

	const	cols =	riverSlots.length === 9 ? 3
					: riverSlots.length === 8 ? 4
					: 3

	return (
		<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl">
			<div className={`grid ${isMobile ? 'gap-x-[14px] gap-y-[8px]' : 'gap-[50px]'}`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
				{riverSlots.map((card, index) => {
					if (!card) {
						return (
							<GameCard
								key={`empty-${index}`}
								className="pointer-events-none invisible"
							/>
						)
					}

					const	isRevealed = cardsRevealed.some(c => c.id === card.id)
					const	isClickable = canAct && !isRevealed

					return (
						<GameCard
							key={card.id}
							value={isRevealed ? card.value : 'back'}
							gameMode={gameMode}
							isClickable={isClickable}
							onClick={() => onFlip(card.id)}
							className={`
								transition-[transform,border,box-shadow] duration-200 ease-in-out
								${isClickable ? 'hover:scale-[1.15] hover:border-game-cyan/70 hover:shadow-[0_0_12px_rgba(0,200,255,0.4)]' : ''}
							`}
						/>
					)
				})}
			</div>
		</div>
	)
}

export default TableArea
