import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useLobby } from '../../context/LobbyContext';
import { useAuth } from '../../context/AuthContext';
import PageCard from './PageCard';
 
function CreateLobbyView() {
 
	const	{ connected, createLobby, lobbyId, lobbyStruct, lobbyError } = useLobby()
	const	{ isAuthenticated } = useAuth()
	const	navigate = useNavigate()
	const	[creating, setCreating] = useState(false)

	useEffect(() => {
		if (!isAuthenticated()) {
			navigate('/login', { replace: true })
			return
		}

		if (connected && !creating) {
			setCreating(true)
			createLobby('CLASSIC', 'SOLO', 3)
		}
	}, [connected, isAuthenticated])

	useEffect(() => {
		if (lobbyId)
			navigate(`/lobby/${lobbyId}`, { replace: true })
	}, [lobbyId])

	if (!isAuthenticated())
		return null

	if (lobbyError) {
		return (
			<PageCard>
				<p className="text-center text-red-400 text-[0.8rem] tracking-[0.15em] uppercase">{lobbyError}</p>
				<button
					className="mt-4 w-full rounded-lg border border-purple-mid/70 bg-purple-brand/25 px-4 py-2 text-[0.7rem] uppercase tracking-ui text-purple-pale transition-all hover:border-purple-str hover:bg-purple-brand/40"
					onClick={() => navigate('/', { replace: true })}
				>
					Back to Home
				</button>
			</PageCard>
		)
	}

	if (!lobbyStruct) {
		return (
			<PageCard>
				<p className="text-center text-[rgba(200,160,255,0.6)] text-[0.8rem] tracking-[0.15em] uppercase">Creating Lobby...</p>
			</PageCard>
		)
	}
}
export default CreateLobbyView
