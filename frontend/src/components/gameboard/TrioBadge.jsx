const	cardImages = import.meta.glob('../../assets/cards/Card_*.png', { eager: true })

const	getCardImage = (label) => {
	const	key = `../../assets/cards/Card_${label}.png`
	return	cardImages[key]?.default
}

function TrioBadge({ trios }) {
	if (!trios || trios.length === 0)
		return null

	return (
		<div className="trio-badge-wrapper">
			<div className="trio-badge">
				<span className="trio-badge-count">{trios.length}</span>
			</div>

			<div className="trio-tooltip">
				{trios.map((value, i) => (
					<div key={i} className="trio-mini-card">
						<img src={getCardImage(value)} alt={`Card ${value}`} className="trio-card-img" />
					</div>
				))}
			</div>
		</div>
	)
}

export default TrioBadge
