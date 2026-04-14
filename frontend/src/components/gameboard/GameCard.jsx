import { useIsMobileGame } from "../../hooks/useIsMobileGame";
import { getCardImage } from "./GameUtils";
import { LINKS } from "../../constants/GameConstants";

function GameCard({ value = 'back', gameMode, className = '', isClickable = false, onClick, origin = '' }) {
	const	isMobile = useIsMobileGame()
	const	cardSize = isMobile
		? "h-[4vw] w-[3vw] min-h-[44px] min-w-[32px]"
		: "h-[min(5.5vw,10vh)] w-[min(4vw,7.5vh)] min-h-[90px] min-w-[70px]"
	const	showLinks = gameMode === 'LINKED' && value !== 'back'

	return (
		<div 
			className={`relative flex overflow-hidden ${cardSize} items-center justify-center rounded-md border border-white/20 bg-black font-bold ${origin} ${isClickable ? 'cursor-pointer' : ''} ${className}`}
			onClick={isClickable ? onClick : undefined}
		>
			<img
				src={getCardImage(value)}
				className="h-full w-full rounded-md object-cover scale-[1.4] object-[center_-28%]"
				alt={`Card ${value}`}
			/>
			{showLinks && (
				<>
					{LINKS[value]?.[0] != null && (
						<span className="absolute bottom-1 left-3 font-moonstrike text-[2rem] text-white leading-none pointer-event-none">
							{LINKS[value]?.[0]}
						</span>
					)}
					{LINKS[value]?.[1] != null && (
						<span className="absolute bottom-1 right-3 font-moonstrike text-[2rem] text-white leading-none pointer-event-none">
							{LINKS[value]?.[1]}
						</span>
					)}
				</>
			)}
		</div>
	)
}

export default GameCard

