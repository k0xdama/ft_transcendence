import TrioBadge from "./TrioBadge"

const cardImages = import.meta.glob('../../assets/cards/Card_*.png', { eager: true })

const getCardImage = (value) => {
	const key = `../../assets/cards/Card_${value}.png`
	return cardImages[key]?.default
}

function PlayerSlot({ player, seat, isCurrentPlayer, isMyTurn, cardsRevealed, onSelect, lastAction }) {
	// const	faceDownCards = Array.from({ length: player.cardCount })
	// const	revealedCards = cardsRevealed?.find(c => c.id && !c.id.includes('middle'))
	const	revealedFromThisPlayer =	lastAction?.target === player.id
										? cardsRevealed.slice(-1)[0]  // last card added
										: null
	return (
		<div
			className={`player-slot seat-${seat} ${isCurrentPlayer ? 'slot-active-turn' : ''} ${isMyTurn ? 'slot-selectable' : ''}`}
			onClick={() => isMyTurn && onSelect(player.id)}
		>
			<span className="player-name">{player.username ?? 'Opponent'}</span>
			<div className="slot-hand-row">
				<div className="face-down-hand">
					{Array.from({ length: player.cardCount }).map((_, i) => {
						const isRevealedSlot = revealedFromThisPlayer && i === player.cardCount - 1
						return isRevealedSlot ? (
							<div key={i} className="card card-front">
								<img src={getCardImage(revealedFromThisPlayer.value)} className="card-img" />
							</div>
						) : (
							<div key={i} className="card card-back" />
						)
					})}
				</div>
				<TrioBadge trios={player.trios} />
			</div>
		</div>
	)
}

export default PlayerSlot
