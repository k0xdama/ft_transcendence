function PlayerHand({ cards }) {
	return (
		<div className="player-hand">
			{cards.map(card => (
				<div key={card.id} className="card card-front">
					{card.label}
				</div>
			))}
		</div>
	)
}

export default PlayerHand
