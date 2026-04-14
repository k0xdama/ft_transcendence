import { useState, useEffect, useRef } from "react"
import { useIsMobileGame } from "../../hooks/useIsMobileGame"
import { TRIO_DESKTOP, TRIO_MOBILE } from "../../constants/GameConstants"
import { getCardImage } from "./GameUtils"
import { LINKS } from "../../constants/GameConstants"

function TrioBadge({ trios, gameMode, seat }) {
	const isMobile = useIsMobileGame()
	const [showPreview, setShowPreview] = useState(false)
	const trioBadgeRef = useRef(null)
	const hasTrios = trios && trios.length > 0
	const showLinks = gameMode === 'LINKED'
	const shouldOpenDownOnMobile = isMobile && seat?.startsWith('top')

	const { arrowClass, labelClass, cardPreviewClass } = isMobile ? TRIO_MOBILE : TRIO_DESKTOP

	// Close preview when clicking outside on mobile
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (isMobile && showPreview && trioBadgeRef.current && !trioBadgeRef.current.contains(event.target)) {
				setShowPreview(false)
			}
		}

		if (showPreview && isMobile) {
			document.addEventListener('click', handleClickOutside)
			return () => document.removeEventListener('click', handleClickOutside)
		}
	}, [showPreview, isMobile])

	if (!hasTrios)
		return null

	return (
		<div 
			ref={trioBadgeRef}
			className={`relative flex flex-col items-center ${isMobile ? '' : 'group'}`}
			onClick={(e) => {
				if (isMobile) {
					e.stopPropagation()
					setShowPreview(!showPreview)
				}
			}}
		>
			<div className={`relative h-0 w-0 cursor-pointer border-l-transparent border-r-transparent border-b-[gold] drop-shadow-[0_0_4px_rgba(255,255,0,0.6)] ${arrowClass}`}>
				<span className={`pointer-events-none absolute left-1/2 -translate-x-1/2 font-bold text-black ${labelClass}`}>{trios.length}</span>
			</div>

			<div className={`absolute left-1/2 z-20 -translate-x-1/2 gap-[0.4rem] whitespace-nowrap rounded-md border border-[rgba(255,255,0,0.4)] bg-[rgba(0,0,0,0.85)] p-[0.4rem] ${shouldOpenDownOnMobile ? 'top-[calc(100%+8px)]' : 'bottom-[calc(100%+8px)]'} ${isMobile ? showPreview ? 'flex' : 'hidden' : 'hidden group-hover:flex'}`}>
				{trios.map((value, i) => (
					<div key={i} className={`overflow-hidden relative rounded border border-white/20 ${cardPreviewClass}`}>
						<img src={getCardImage(value)} alt={`Card ${value}`} className="h-full w-full object-cover scale-[1.4] object-[center_-28%]" />
						{showLinks && (
							<>
								{LINKS[value]?.[0] != null && (
									<span className="absolute bottom-1 left-3 font-moonstrike text-[1rem] text-white leading-none pointer-event-none">
										{LINKS[value]?.[0]}
									</span>
								)}
								{LINKS[value]?.[1] != null && (
									<span className="absolute bottom-1 right-3 font-moonstrike text-[1rem] text-white leading-none pointer-event-none">
										{LINKS[value]?.[1]}
									</span>
								)}
							</>
						)}
					</div>
				))}
			</div>
		</div>
	)
}

export default TrioBadge
