import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMatchmaking } from '../../context/MatchmakingContext'
import './WaitingMatchmakingView.css'

function WaitingMatchmakingView() {
	const navigate = useNavigate()
	const location = useLocation()
	const { gameId, error, leaveMatchmaking } = useMatchmaking()

	const { gameMode, gameType, maxUsers } = location.state || {}

	useEffect(() => {
		if (!location.state) {
			navigate('/matchmaking')
		}
	}, [location.state, navigate])

	useEffect(() => {
		if (gameId) {
			navigate(`/game/${gameId}`)
		}
	}, [gameId, navigate])

	const handleCancel = () => {
		leaveMatchmaking()
		navigate('/matchmaking')
	}

	if (!location.state) return null

	return (
		<div className='waiting-view'>
			<div className='waiting-card'>
				<h2 className='waiting-title'>Searching for opponents</h2>

				<div className='waiting-info'>
					<p>Mode <span>{gameMode}</span></p>
					<p>Type <span>{gameType}</span></p>
					<p>Players <span>{maxUsers}</span></p>
				</div>

				<div className='waiting-animation'>
					<div className='waiting-dots'>
						<span className='dot'></span>
						<span className='dot'></span>
						<span className='dot'></span>
					</div>
					<p className='waiting-text'>Looking for players</p>
				</div>

				{error && <p className='waiting-error'>{error}</p>}

				<button className='btn-cancel' onClick={handleCancel}>
					Cancel
				</button>
			</div>
		</div>
	)
}

export default WaitingMatchmakingView
