import { useIsMobileGame } from "../../hooks/useIsMobileGame"
import { COUNTDOWN_DESKTOP, COUNTDOWN_MOBILE } from "../../constants/GameConstants"

function	CountdownRing({duration, label, color = '#00dcff'}) {
	const	isMobile = useIsMobileGame()
	const	{ size, radius, strokeWidth, labelClass } = isMobile ? COUNTDOWN_MOBILE : COUNTDOWN_DESKTOP
	const	circumference = 2 * Math.PI * radius
	const	center = size / 2

	return (
		<div className="relative flex flex-col items-center gap-1">
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
				<circle cx={center} cy={center} r={radius}
					fill='none' stroke="rgba(255, 255, 255, 0.08)" strokeWidth={strokeWidth} />
				<circle cx={center} cy={center} r={radius}
					fill="none"
					stroke={color}
					strokeWidth={strokeWidth}
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset="0"
					style={{
						'--countdown-circumference': `${circumference}`,
						transformOrigin: `${center}px ${center}px`,
						transform: 'rotate(-90deg)',
						animation: `countdown-drain ${duration}s linear forwards`,
						filter: `drop-shadow(0 0 6px ${color})`
					}}
				/>
			</svg>
			{label && <span className={`uppercase tracking-[0.15em] text-[rgba(200,160,255,0.6)] ${labelClass}`}>{label}</span>}
		</div>
	)
}

export default CountdownRing
