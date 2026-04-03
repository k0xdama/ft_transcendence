function	CountdownRing({duration, label, color = '#00dcff'}) {
	const	radius = 28
	const	circumference = 2 * Math.PI * radius

	return (
		<div className="countdown-ring-wrapper">
			<svg width="70" height="70" viewBox="0 0 70 70">
				<circle cx="35" cy="35" r={radius}
					fill='none' stroke="rgba(255, 255, 255, 0.08)" strokeWidth="4" />
				<circle cx="35" cy="35" r={radius}
					fill="none"
					stroke={color}
					strokeWidth="4"
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset="0"
					style={{
						transformOrigin: '35px 35px',
						transform: 'rotate(-90deg)',
						animation: `countdown-drain ${duration}s linear forwards`,
						filter: `drop-shadow(0 0 6px ${color})`
					}}
				/>
			</svg>
			{label && <span className="countdown-label">{label}</span>}
		</div>
	)
}

export default CountdownRing
