const cardImages = import.meta.glob('../../assets/cards/Card_*.png', { eager: true })

const getCardImage = (value) => {
	const key = `../../assets/cards/Card_${value}.png`
	return cardImages[key]?.default
}

function TableArea({ cards }) {
	const cols = cards.length === 9 ? 3
				: cards.length === 8 ? 4
				: 3
	return (
		<div className="table-area">
			<div
				className="river"
				style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
			>
				{cards.map((card) => (
					card.revealed
						? <div key={card.id} className="card card-front">
							<img
								src={getCardImage(card.value)}
								alt={`Card ${card.value}`}
								className="card-img"
							/>
						  </div>
						: <div key={card.id} className="card card-back" />
				))}
			</div>
		</div>
	)
}

export default TableArea
