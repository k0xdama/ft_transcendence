function ProfileAchievements({ stats }) {
	if (!stats)
		return <p className="text-xs uppercase tracking-ui text-purple-pale/85 text-center animate-crt-blink">Loading achievements...</p>

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
		<div className="flex flex-col gap-5">
			<div className="text-center pb-4 border-b border-purple-dim">
				<span className="text-3xl font-bold tracking-wide" style={{ color: '#ffd700' }}>{unlocked}</span>
				<span className="text-xs uppercase tracking-ui text-purple-pale/60 ml-1">/ {achievements.length} unlocked</span>
			</div>

			<div className="flex flex-col gap-2.5">
				{achievements.map((achievement) => (
					<div
						className={`flex items-start gap-3.5 px-4 py-3 bg-white/4 border rounded-xl transition-all ${achievement.unlocked ? 'border-yellow-600/35 shadow-lg shadow-yellow-500/10' : 'opacity-45 border-purple-dim'}`}
						key={achievement.id}
					>
						<span className="text-2xl min-w-9 text-center">{achievement.icon}</span>
						<div className="flex flex-col gap-0.5 flex-1">
							<span className={`text-sm font-bold uppercase tracking-wider ${achievement.unlocked ? 'text-purple-pale' : 'text-purple-pale/60'}`}>{achievement.name}</span>
							<span className={`text-xs uppercase tracking-wider ${achievement.unlocked ? 'text-purple-pale/55' : 'text-purple-pale/55'}`}>{achievement.description}</span>
							{!achievement.unlocked && achievement.progress !== undefined && (
								<div className="relative w-full h-1 bg-white/6 rounded mt-1 overflow-hidden">
									<div
										className="h-full bg-purple-brand/60 rounded transition-all duration-400"
										style={{ width: `${(achievement.progress / achievement.max) * 100}%` }}
									/>
									<span className="absolute right-1 -top-3 text-xs uppercase tracking-wider text-purple-pale/50">
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
