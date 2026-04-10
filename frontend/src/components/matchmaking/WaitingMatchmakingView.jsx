import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLobby } from '../../context/LobbyContext'
// import './WaitingMatchmakingView.css'

function WaitingMatchmakingView() {
	const navigate = useNavigate()
	const location = useLocation()
	const { gameId, lobbyError: error, leaveMatchmaking } = useLobby()

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

	if (!location.state)
		return null

	return (
		<div className='flex flex-col items-center pt-20 gap-6'>
			<div className='bg-card border border-purple-mid rounded-2xl p-8 w-96 backdrop-blur-3xl shadow-card text-center'>
				<h2 className='text-lg uppercase tracking-title text-purple-pale text-shadow-purple m-0 mb-6 animate-crt-pulse'>Searching for opponents</h2>

				<div className='flex justify-center gap-6 mb-6 pb-5 border-b border-purple-dim'>
					<p className='text-xs uppercase tracking-ui text-white/70 m-0'>Mode <span className='text-purple-pale font-bold'>{gameMode}</span></p>
					<p className='text-xs uppercase tracking-ui text-white/70 m-0'>Type <span className='text-purple-pale font-bold'>{gameType}</span></p>
					<p className='text-xs uppercase tracking-ui text-white/70 m-0'>Players <span className='text-purple-pale font-bold'>{maxUsers}</span></p>
				</div>

				<div className='my-8 flex flex-col items-center gap-4'>
					<div className='flex gap-3'>
						<span className='w-3 h-3 rounded-full bg-purple-light shadow-lg shadow-purple-light/60 animate-dot-bounce'></span>
						<span className='w-3 h-3 rounded-full bg-purple-light shadow-lg shadow-purple-light/60 animate-dot-bounce' style={{animationDelay: '0.2s'}}></span>
						<span className='w-3 h-3 rounded-full bg-purple-light shadow-lg shadow-purple-light/60 animate-dot-bounce' style={{animationDelay: '0.4s'}}></span>
					</div>
					<p className='text-xs uppercase tracking-ui text-white/85 m-0 animate-crt-blink'>Looking for players</p>
				</div>

				{error && <p className='text-red-500 text-xs mb-4'>{error}</p>}

				<button className='px-7 py-2.5 rounded border border-cyan-str bg-cyan-glow/8 text-cyan-glow uppercase tracking-ui text-xs hover:bg-cyan-glow/18 hover:shadow-lg hover:shadow-cyan-glow/30 transition-all cursor-pointer' onClick={handleCancel}>
					Cancel
				</button>
			</div>
		</div>
	)
}

export default WaitingMatchmakingView
