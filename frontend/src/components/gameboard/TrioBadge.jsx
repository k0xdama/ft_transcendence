import { useIsMobileGame } from "../../hooks/useIsMobileGame"
import { TRIO_DESKTOP, TRIO_MOBILE } from "../../constants/GameConstants"

const	cardImages = import.meta.glob('../../assets/cards/Card_*.png', { eager: true })

const	getCardImage = (label) => {
	const key = `../../assets/cards/Card_${label}.png`
	return cardImages[key]?.default
}

function TrioBadge({ trios }) {
	const isMobile = useIsMobileGame()

	if (!trios || trios.length === 0)
		return null

	const { arrowClass, labelClass, cardPreviewClass } = isMobile ? TRIO_MOBILE : TRIO_DESKTOP

	return (
		<div className="group relative flex flex-col items-center">
			<div className={`relative h-0 w-0 cursor-pointer border-l-transparent border-r-transparent border-b-[gold] drop-shadow-[0_0_4px_rgba(255,255,0,0.6)] ${arrowClass}`}>
				<span className={`pointer-events-none absolute left-1/2 -translate-x-1/2 font-bold text-black ${labelClass}`}>{trios.length}</span>
			</div>

			<div className={`absolute bottom-[calc(100%+8px)] left-1/2 z-20 hidden -translate-x-1/2 gap-[0.4rem] whitespace-nowrap rounded-md border border-[rgba(255,255,0,0.4)] bg-[rgba(0,0,0,0.85)] p-[0.4rem] group-hover:flex`}>
				{trios.map((value, i) => (
					<div key={i} className={`overflow-hidden rounded border border-white/20 ${cardPreviewClass}`}>
						<img src={getCardImage(value)} alt={`Card ${value}`} className="h-full w-full object-contain" />
					</div>
				))}
			</div>
		</div>
	)
}

export default TrioBadge
