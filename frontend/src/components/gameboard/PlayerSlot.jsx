import TrioBadge from "./TrioBadge"

const cardImages = import.meta.glob('../../assets/cards/Card_*.png', { eager: true })

const getCardImage = (value) => {
	const key = `../../assets/cards/Card_${value}.png`
	return cardImages[key]?.default
}

function PlayerSlot({ player, seat, isCurrentPlayer, isMyTurn, revealedHandCards, onSelect, lastAction }) {
	return (
		<div
			className={`player-slot seat-${seat} ${isCurrentPlayer ? 'slot-active-turn' : ''} ${isMyTurn ? 'slot-selectable' : ''}`}
			onClick={() => isMyTurn && onSelect(player.id)}
		>
			<span className="player-name">{player.username ?? 'Opponent'}</span>
			<div className="slot-hand-row">
				<div className="face-down-hand">
					{Array.from({ length: player.cardCount }).map((_, i) => (
						<div key={i} className="card card-back" />
					))}
				</div>
				<TrioBadge trios={player.trios} />
			</div>
			{revealedHandCards.length > 0 && (
				<div className={`revealed-hand-cards slot-revealed seat-revealed-${seat}`}>
					{revealedHandCards.map(rc => (
						<div key={rc.cardId} className="card card-front revealed-card">
							<img src={getCardImage(rc.value)} className="card-img" alt={`Card ${rc.value}`} />
						</div>
					))}
				</div>
			)}
		</div>
	)
}

export default PlayerSlot
