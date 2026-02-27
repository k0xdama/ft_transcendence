function PlayerHand({ cards, seat }) {
	return (
		<div className={`player-hand ${seat}`}>
			{cards.map(card => (
				<div key={card.id} className="card card-front">
					{card.label}
				</div>
			))}
		</div>
	)
}

export default PlayerHand
