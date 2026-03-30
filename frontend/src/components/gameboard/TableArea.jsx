const cardImages = import.meta.glob('../../assets/cards/Card_*.png', { eager: true })

const getCardImage = (value) => {
	const key = `../../assets/cards/Card_${value}.png`
	return cardImages[key]?.default
}

function TableArea({ cards, isMyTurn, onFlip }) {
	const cols = cards.length === 9 ? 3
				: cards.length === 8 ? 4
				: 3
	return (
		<div className="table-area">
			<div
				className="river"
				style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
			>
				{cards.map((card, index) => (
					<div
						key={card.id}
						className={`card ${isMyTurn ? 'card-active' : ''} ${card.revealed ? 'card-front' : 'card-back'}`}
						onClick={() => isMyTurn && !card.revealed && onFlip(index)}
					>
						{card.revealed && <img src={getCardImage(card.value)} alt={`Card ${card.value}`} className="card-img"/>}
					</div>
				))}
			</div>
		</div>
	)
}

export default TableArea
