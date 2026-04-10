function ProfileStats({ stats }) {
	if (!stats) return <p className="text-xs uppercase tracking-ui text-purple-pale/85 text-center animate-crt-blink">Loading stats...</p>

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
		<div className="flex flex-col gap-7">
			<div className="grid grid-cols-2 gap-3">
				{statCards.map((card) => (
					<div className="flex flex-col items-center gap-1 p-4 bg-white/4 border border-purple-dim rounded-xl hover:border-purple-mid hover:shadow-lg hover:shadow-purple-brand/15 transition-all" key={card.label}>
						<span className="text-2xl">{card.icon}</span>
						<span className="text-2xl font-bold tracking-wide" style={{ color: card.color }}>{card.value}</span>
						<span className="text-xs uppercase tracking-ui text-white/60">{card.label}</span>
					</div>
				))}
			</div>

			<div className="flex flex-col gap-4">
				{detailStats.map((stat) => (
					<div className="flex flex-col gap-1.5" key={stat.label}>
						<div className="flex justify-between items-center">
							<span className="text-xs uppercase tracking-ui text-purple-pale/70">{stat.label}</span>
							<span className="text-sm font-bold tracking-wide" style={{ color: stat.color }}>{stat.value}</span>
						</div>
						<div className="w-full h-1.5 bg-white/6 rounded overflow-hidden">
							<div
								className="h-full rounded transition-all duration-600"
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
