function ProfileStats({ stats }) {
	if (!stats)
		return <p className="profile-loading">Loading stats...</p>

	const winRate = stats.gamesPlayed > 0
		? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
		: 0

	const statCards = [
		{
			label: 'Games Played',
			value: stats.gamesPlayed,
			icon: '🎮',
			color: '#c060ff'
		},
		{
			label: 'Victories',
			value: stats.gamesWon,
			icon: '🏆',
			color: '#00dcff'
		},
		{
			label: 'Defeats',
			value: stats.gamesLost,
			icon: '💀',
			color: '#ff6b6b'
		},
		{
			label: 'Total Score',
			value: stats.totalScore,
			icon: '⭐',
			color: '#ffd700'
		}
	]

	const detailStats = [
		{
			label: 'Win Rate',
			value: `${winRate}%`,
			maxValue: 100,
			current: winRate,
			color: '#00dcff'
		},
		{
			label: 'Actions Played',
			value: stats.totalActions,
			maxValue: Math.max(stats.totalActions, 1),
			current: stats.totalActions,
			color: '#c060ff'
		},
		{
			label: 'Trios of 7',
			value: stats.triosOf7,
			maxValue: Math.max(stats.triosOf7, 10),
			current: stats.triosOf7,
			color: '#ffd700'
		},
		{
			label: 'Total Combos',
			value: stats.totalCombos,
			maxValue: Math.max(stats.totalCombos, 10),
			current: stats.totalCombos,
			color: '#e0aaff'
		},
		{
			label: 'Longest Combo',
			value: stats.longestCombo,
			maxValue: Math.max(stats.longestCombo, 5),
			current: stats.longestCombo,
			color: '#ff6bcb'
		},
		{
			label: 'Perfect Games',
			value: stats.perfectGames,
			maxValue: Math.max(stats.perfectGames, 5),
			current: stats.perfectGames,
			color: '#00ff87'
		}
	]

	return (
		<div className="stats-container">
			<div className="stats-grid">
				{statCards.map((card) => (
					<div className="stat-card" key={card.label}>
						<span className="stat-icon">{card.icon}</span>
						<span className="stat-value" style={{ color: card.color }}>{card.value}</span>
						<span className="stat-label">{card.label}</span>
					</div>
				))}
			</div>

			<div className="stats-bars">
				{detailStats.map((stat) => (
					<div className="stat-bar-row" key={stat.label}>
						<div className="stat-bar-header">
							<span className="stat-bar-label">{stat.label}</span>
							<span className="stat-bar-value" style={{ color: stat.color }}>{stat.value}</span>
						</div>
						<div className="stat-bar-track">
							<div
								className="stat-bar-fill"
								style={{
									width: `${Math.min((stat.current / stat.maxValue) * 100, 100)}%`,
									backgroundColor: stat.color,
									boxShadow: `0 0 10px ${stat.color}80`
								}}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default ProfileStats
