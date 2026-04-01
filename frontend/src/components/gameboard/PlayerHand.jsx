import TrioBadge from "./TrioBadge"

const	cardImages = import.meta.glob('../../assets/cards/Card_*.png', { eager: true })

const	getCardImage = (label) => {
	const	key = `../../assets/cards/Card_${label}.png`
	return	cardImages[key]?.default
}

function PlayerHand({ cards, revealedHandCards, seat, trios, isMyTurn, onSelectSelf }) {
	return (
		<div
			className={`player-hand-wrapper ${seat} ${isMyTurn ? 'my-turn-active' : ''}`}
			onClick={() => isMyTurn && onSelectSelf()}
		>
			<div className={"player-hand"}>
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
			{revealedHandCards.length > 0 && (
				<div className="revealed-hand-cards">
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

export default PlayerHand
