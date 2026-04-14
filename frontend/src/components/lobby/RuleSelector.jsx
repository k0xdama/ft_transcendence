import { GAME_MODES, PLAYER_OPTIONS } from "../../constants/GameConstants";

function RuleSelector({
	gameMode,
	maxUsers,
	onModeChange,
	onPlayerChange,
	disabled = false,
	modeBaseClass,
	modeActiveClass,
	playerBaseClass,
	playerActiveClass
}) {
	return (
		<>
			<div className="mb-5">
				<p className="m-0 mb-2.5 text-[0.72rem] tracking-ui uppercase text-white/70">Game Mode</p>
				<div className="flex gap-2.5 justify-center">
					{GAME_MODES.map(mode => (
						<button
							key={mode.value}
							className={`${modeBaseClass} ${gameMode === mode.value ? modeActiveClass : ''}`}
							onClick={() => onModeChange(mode.value)}
							disabled={disabled}
						>
							<span className="text-[0.85rem] font-bold tracking-[0.1em] uppercase text-purple-pale">{mode.label}</span>
							<span className="text-[0.65rem] tracking-[0.05em] text-[rgba(223,213,236,0.5)]">{mode.desc}</span>
						</button>
					))}
				</div>
			</div>

			<div className="mb-5">
				<p className="m-0 mb-2.5 text-[0.72rem] tracking-ui uppercase text-white/70">Players</p>
				<div className="flex gap-2.5 justify-center">
					{PLAYER_OPTIONS.map(n => (
						<button
							key={n}
							className={`${playerBaseClass} ${maxUsers === n ? playerActiveClass : ''}`}
							onClick={() => onPlayerChange(n)}
							disabled={disabled}
						>
							{n}
						</button>
					))}
				</div>
			</div>
		</>
	)
}

export default RuleSelector
