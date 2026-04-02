const cardImages = import.meta.glob('../../assets/cards/Card_*.png', { eager: true })

const getCardImage = (value) => {
	const key = `../../assets/cards/Card_${value}.png`
	return cardImages[key]?.default
}

function TableArea({ riverSlots, isMyTurn, currentAction, cardsRevealed, onFlip }) {
	const	actionsUsed = cardsRevealed.length
	const	expectedRevealed = { FIRST: 0, SECOND: 1, BONUS: 2 }
	const	canAct = isMyTurn && actionsUsed === expectedRevealed[currentAction]

	const	cols =	riverSlots.length === 9 ? 3
					: riverSlots.length === 8 ? 4
					: 3

	return (
		<div className="table-area">
			<div className="river" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
				{riverSlots.map((card, index) => {
					if (!card) {
						return <div key={`empty-${index}`} className="card card-empty" />
					}

					const	isRevealed = cardsRevealed.some(c => c.id === card.id)
					const	isClickable = canAct && !isRevealed

					return (
						<div
							key={card.id}
							className={`card ${isClickable ? 'card-active' : ''} ${isRevealed ? 'card-front' : 'card-back'}`}
							onClick={() => isClickable && onFlip(card.id)}
						>
							{isRevealed && <img src={getCardImage(card.value)} alt={`Card ${card.value}`} className="card-img"/>}
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default TableArea
