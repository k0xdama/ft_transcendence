function ProfileAchievements({ stats }) {
	if (!stats)
		return <p className="profile-loading">Loading achievements...</p>

	const achievements = [
		{
			id: 'first_game',
			name: 'First Steps',
			description: 'Play your first game',
			unlocked: stats.gamesPlayed >= 1,
			icon: '🎮'
		},
		{
			id: 'games_10',
			name: 'Regular',
			description: 'Play 10 games',
			unlocked: stats.gamesPlayed >= 10,
			progress: Math.min(stats.gamesPlayed, 10),
			max: 10,
			icon: '🕹️'
		},
		{
			id: 'games_50',
			name: 'Veteran',
			description: 'Play 50 games',
			unlocked: stats.gamesPlayed >= 50,
			progress: Math.min(stats.gamesPlayed, 50),
			max: 50,
			icon: '🎖️'
		},
		{
			id: 'games_100',
			name: 'Centurion',
			description: 'Play 100 games',
			unlocked: stats.gamesPlayed >= 100,
			progress: Math.min(stats.gamesPlayed, 100),
			max: 100,
			icon: '👑'
		},
		{
			id: 'first_win',
			name: 'Winner',
			description: 'Win your first game',
			unlocked: stats.gamesWon >= 1,
			icon: '🏆'
		},
		{
			id: 'wins_10',
			name: 'Champion',
			description: 'Win 10 games',
			unlocked: stats.gamesWon >= 10,
			progress: Math.min(stats.gamesWon, 10),
			max: 10,
			icon: '🥇'
		},
		{
			id: 'first_trio7',
			name: 'Lucky Seven',
			description: 'Score a Trio of 7',
			unlocked: stats.triosOf7 >= 1,
			icon: '7️⃣'
		},
		{
			id: 'trio7_10',
			name: 'Seven Master',
			description: 'Score 10 Trios of 7',
			unlocked: stats.triosOf7 >= 10,
			progress: Math.min(stats.triosOf7, 10),
			max: 10,
			icon: '🔮'
		},
		{
			id: 'first_combo',
			name: 'Combo Starter',
			description: 'Get your first combo (2+ trios in a row)',
			unlocked: stats.totalCombos >= 1,
			icon: '🔥'
		},
		{
			id: 'combo_3',
			name: 'Combo King',
			description: 'Achieve a combo of 3+',
			unlocked: stats.longestCombo >= 3,
			icon: '💥'
		},
		{
			id: 'combo_5',
			name: 'Unstoppable',
			description: 'Achieve a combo of 5+',
			unlocked: stats.longestCombo >= 5,
			icon: '⚡'
		},
		{
			id: 'perfect_game',
			name: 'Flawless Victory',
			description: 'Win without any opponent scoring a trio',
			unlocked: stats.perfectGames >= 1,
			icon: '💎'
		},
		{
			id: 'perfect_3',
			name: 'Perfectionist',
			description: 'Win 3 perfect games',
			unlocked: stats.perfectGames >= 3,
			progress: Math.min(stats.perfectGames, 3),
			max: 3,
			icon: '✨'
		},
		{
			id: 'score_50',
			name: 'High Scorer',
			description: 'Accumulate 50 total score',
			unlocked: stats.totalScore >= 50,
			progress: Math.min(stats.totalScore, 50),
			max: 50,
			icon: '⭐'
		},
		{
			id: 'score_200',
			name: 'Score Legend',
			description: 'Accumulate 200 total score',
			unlocked: stats.totalScore >= 200,
			progress: Math.min(stats.totalScore, 200),
			max: 200,
			icon: '🌟'
		}
	]

	const unlocked = achievements.filter(a => a.unlocked).length

	return (
		<div className="achievements-container">
			<div className="achievements-summary">
				<span className="achievements-count" style={{ color: '#ffd700' }}>{unlocked}</span>
				<span className="achievements-total">/ {achievements.length} unlocked</span>
			</div>

			<div className="achievements-grid">
				{achievements.map((achievement) => (
					<div
						className={`achievement-badge ${achievement.unlocked ? 'unlocked' : 'locked'}`}
						key={achievement.id}
					>
						<span className="achievement-icon">{achievement.icon}</span>
						<div className="achievement-info">
							<span className="achievement-name">{achievement.name}</span>
							<span className="achievement-desc">{achievement.description}</span>
							{!achievement.unlocked && achievement.progress !== undefined && (
								<div className="achievement-progress-bar">
									<div
										className="achievement-progress-fill"
										style={{ width: `${(achievement.progress / achievement.max) * 100}%` }}
									/>
									<span className="achievement-progress-text">
										{achievement.progress}/{achievement.max}
									</span>
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default ProfileAchievements
