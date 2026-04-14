import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLobby } from '../../context/LobbyContext'
import { useAuth } from '../../context/AuthContext'
import PageCard from '../lobby/PageCard'
import RuleSelector from '../lobby/RuleSelector'

const modeBase = "flex-1 flex flex-col items-center gap-1 px-3 py-3.5 rounded-lg border transition-all cursor-pointer border-purple-dim bg-card hover:border-purple-mid hover:bg-purple-brand/10"
const modeActive = "!border-purple-str !bg-purple-brand/20 !shadow-lg !shadow-purple-brand/30"
const playerBase = "inline-flex h-12 w-12 items-center justify-center rounded-lg border text-base font-bold leading-none transition-all cursor-pointer border-purple-mid/40 bg-card text-white/85 hover:border-purple-mid hover:bg-purple-brand/12"
const playerActive = "!border-purple-str !bg-purple-brand/20 !shadow-lg !shadow-purple-brand/30 !text-purple-pale"

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

	return (
		<PageCard outerClassName='pt-8 md:pt-20'>
			<h2 className='text-lg uppercase tracking-title text-purple-pale text-shadow-purple m-0 mb-7 text-center'>Public Match</h2>

			{error && <p className='text-red-500 text-xs text-center mb-4'>{error}</p>}

			<RuleSelector
				gameMode={gameMode}
				maxUsers={maxUsers}
				onModeChange={setGameMode}
				onPlayerChange={setMaxUsers}
				modeBaseClass={modeBase}
				modeActiveClass={modeActive}
				playerBaseClass={playerBase}
				playerActiveClass={playerActive}
			/>

			<button className='w-full px-7 py-3 rounded border border-purple-mid/50 bg-purple-brand/15 text-purple-light uppercase tracking-ui text-sm hover:bg-purple-brand/30 hover:shadow-lg hover:shadow-purple-brand/40 transition-all cursor-pointer' onClick={handleSearch}>
				Search Game
			</button>
		</PageCard>
	)
}

export default PublicMatchmakingView
