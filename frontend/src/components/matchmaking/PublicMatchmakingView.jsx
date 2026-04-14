import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLobby } from '../../context/LobbyContext'
import { useAuth } from '../../context/AuthContext'
// import './PublicMatchmakingView.css'

function PublicMatchmakingView() {
	const [gameMode, setGameMode] = useState('CLASSIC')
	const [maxUsers, setMaxUsers] = useState(3)
	const [error, setError] = useState(null)

	const { gameId, joinMatchmaking, leaveMatchmaking } = useLobby()
	const { isAuthenticated } = useAuth()
	const navigate = useNavigate()

	const handleSearch = () => {
		setError(null)
		if (!isAuthenticated()) {
			setError('You must be logged in to search for a game!')
			return
		}
		joinMatchmaking(gameMode, 'SOLO', maxUsers)
		navigate('/matchmaking/waiting', {
			state: { gameMode, gameType: 'SOLO', maxUsers }
		})
	}

	const modes = [
		{ value: 'CLASSIC', label: 'Classic', desc: 'Win 3 trios' },
		{ value: 'LINKED', label: 'Linked', desc: 'Win 2 linked trios' }
	]

	const playerOptions = [3, 4, 5, 6]

	return (
		<div className='flex flex-col items-center pt-8 gap-6 w-full px-4 md:pt-20 md:px-0'>
			<div className='bg-card border border-purple-mid rounded-2xl p-6 w-full max-w-96 backdrop-blur-3xl shadow-card md:p-8'>
				<h2 className='text-lg uppercase tracking-title text-purple-pale text-shadow-purple m-0 mb-7 text-center'>Public Match</h2>

				{error && <p className='text-red-500 text-xs text-center mb-4'>{error}</p>}

				<div className='mb-6'>
					<p className='m-0 mb-2.5 text-xs uppercase tracking-ui text-white/70'>Game Mode</p>
					<div className='flex gap-3'>
						{modes.map(mode => (
							<button
								key={mode.value}
								className={`flex-1 flex flex-col items-center gap-1 px-3 py-3.5 rounded-lg border transition-all cursor-pointer ${gameMode === mode.value ? 'border-purple-str bg-purple-brand/20 shadow-lg shadow-purple-brand/30' : 'border-purple-dim bg-card hover:border-purple-mid hover:bg-purple-brand/10'}`}
								onClick={() => setGameMode(mode.value)}
							>
								<span className='text-sm font-bold uppercase tracking-ui text-purple-pale'>{mode.label}</span>
								<span className='text-xs tracking-widest text-white/50'>{mode.desc}</span>
							</button>
						))}
					</div>
				</div>

				<div className='mb-6'>
					<p className='m-0 mb-2.5 text-xs uppercase tracking-ui text-white/70'>Players</p>
					<div className='flex justify-center gap-3'>
						{playerOptions.map(n => (
							<button
								key={n}
								className={`inline-flex h-12 w-12 items-center justify-center rounded-lg border text-base font-bold leading-none transition-all cursor-pointer ${maxUsers === n ? 'border-purple-str bg-purple-brand/20 shadow-lg shadow-purple-brand/30 text-purple-pale' : 'border-purple-mid/40 bg-card text-white/85 hover:border-purple-mid hover:bg-purple-brand/12'}`}
								onClick={() => setMaxUsers(n)}
							>
								{n}
							</button>
						))}
					</div>
				</div>

				<button className='w-full px-7 py-3 rounded border border-purple-mid/50 bg-purple-brand/15 text-purple-light uppercase tracking-ui text-sm hover:bg-purple-brand/30 hover:shadow-lg hover:shadow-purple-brand/40 transition-all cursor-pointer' onClick={handleSearch}>
					Search Game
				</button>
			</div>
		</div>
	)
}

export default PublicMatchmakingView
