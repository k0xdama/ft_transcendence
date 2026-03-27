import TrioBadge from "./TrioBadge"

function PlayerSlot({ player, seat }) {
	const	faceDownCards = Array.from({ length: player.cardCount })

	return (
		<div className={`player-slot seat-${seat}`}>
			<span className="player-name">{player.username ?? 'Opponent'}</span>
			<div className="slot-hand-row">
				<div className="face-down-hand">
					{faceDownCards.map((_,i) => (
						<div key={i} className="card card-back" />
					))}
				</div>
				<TrioBadge trios={player.trios} />
			</div>
		</div>
	)
}

export default PlayerSlot
