import TrioBadge from "./TrioBadge"

const	cardImages = import.meta.glob('../../assets/cards/Card_*.png', { eager: true })

const	getCardImage = (label) => {
	const	key = `../../assets/cards/Card_${label}.png`
	return	cardImages[key]?.default
}

function PlayerHand({ cards, seat, trios }) {
	return (
		<div className={`player-hand-wrapper ${seat}`}>
			<div className={`player-hand ${seat}`}>
				{cards.map(card => (
					<div key={card.id} className="card card-front">
						<img
							src={getCardImage(card.value)}
							alt={`Card ${card.value}`}
							className="card-img"
						/>
					</div>
				))}
				<TrioBadge trios={trios} />
			</div>
		</div>
	)
}

export default PlayerHand
