import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMatchmaking } from '../../context/MatchmakingContext'
import { useAuth } from '../../context/AuthContext'
import './PublicMatchmakingView.css'

function PublicMatchmakingView() {
	const [gameMode, setGameMode] = useState('CLASSIC')
	const [gameType, setGameType] = useState('SOLO')
	const [maxUsers, setMaxUsers] = useState(3)
	const [error, setError] = useState(null)

	const { connect, joinMatchmaking } = useMatchmaking()
	const { accessToken } = useAuth()
	const navigate = useNavigate()

	const handleSearch = () => {
		setError(null)
		if (!accessToken) {
			setError('You must be logged in to search for a game!')
			return
		}
		connect(
			accessToken,
			() => {
				joinMatchmaking(gameMode, gameType, maxUsers)
				navigate('/matchmaking/waiting', {
					state: { gameMode, gameType, maxUsers }
				})
			},
			(msg) => setError(msg)
		)
	}

	const modes = [
		{ value: 'CLASSIC', label: 'Classic', desc: 'Win 3 trios' },
		{ value: 'LINKED', label: 'Linked', desc: 'Win 2 linked trios' }
	]

	const types = [
		{ value: 'SOLO', label: 'Solo' },
		{ value: 'TEAM_UP', label: 'Team Up' }
	]

	const playerOptions = [3, 4, 5, 6]

	return (
		<div className='matchmaking-view'>
			<div className='matchmaking-card'>
				<h2 className='matchmaking-title'>Public Match</h2>

				{error && <p className='matchmaking-error'>{error}</p>}

				<div className='matchmaking-section'>
					<p className='section-label'>Game Mode</p>
					<div className='mode-options'>
						{modes.map(mode => (
							<button
								key={mode.value}
								className={`mode-btn ${gameMode === mode.value ? 'mode-active' : ''}`}
								onClick={() => setGameMode(mode.value)}
							>
								<span className='mode-name'>{mode.label}</span>
								<span className='mode-desc'>{mode.desc}</span>
							</button>
						))}
					</div>
				</div>

				<div className='matchmaking-section'>
					<p className='section-label'>Game Type</p>
					<div className='type-options'>
						{types.map(type => (
							<button
								key={type.value}
								className={`type-btn ${gameType === type.value ? 'type-active' : ''}`}
								onClick={() => setGameType(type.value)}
							>
								{type.label}
							</button>
						))}
					</div>
				</div>

				<div className='matchmaking-section'>
					<p className='section-label'>Players</p>
					<div className='player-options'>
						{playerOptions.map(n => (
							<button
								key={n}
								className={`player-btn ${maxUsers === n ? 'player-active' : ''}`}
								onClick={() => setMaxUsers(n)}
							>
								{n}
							</button>
						))}
					</div>
				</div>

				<button className='btn-search' onClick={handleSearch}>
					Search Game
				</button>
			</div>
		</div>
	)
}

export default PublicMatchmakingView
