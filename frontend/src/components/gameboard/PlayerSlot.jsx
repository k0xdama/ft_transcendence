function PlayerSlot({ player }) {
	return (
		<div className={`player-slot ${player.isTurn ? "active-turn" : ""}`}>
			<span>{player.username}</span>
			<span> -- {player.cardCount} cards</span>
		</div>
	)
}

export default PlayerSlot
