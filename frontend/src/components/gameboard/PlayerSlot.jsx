function PlayerSlot({ player, seat }) {
	const	faceDownCards = Array.from({ length: player.cardCount })

	return (
		<div className={`player-slot seat-${seat}`}>
			<span className="player-name">{player.username}</span>
			<div className="face-down-hand">
				{faceDownCards.map((_,i) => (
					<div key={i} className="card card-back" />
				))}
			</div>
		</div>
	)
}

export default PlayerSlot
