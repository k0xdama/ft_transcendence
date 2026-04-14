const cardImages = import.meta.glob('../../assets/cards/Card_*.png', { eager: true })

export const getCardImage = (label) => {
	const key = `../../assets/cards/Card_${label}.png`
	return cardImages[key]?.default
}
