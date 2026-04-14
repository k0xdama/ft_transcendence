import { useNavigate } from 'react-router-dom'
import { useLobby } from '../../context/LobbyContext'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import AuthCard from '../auth/AuthCard'
import AuthField from '../auth/AuthField'

function JoinGameView() {
	const	[inputLobbyId, setInputLobbyId] = useState('')
	const	[error, setError] = useState(null)
	const	[joining, setJoining] = useState(false)
	const	{ lobbyId, joinLobby, lobbyError, setLobbyError } = useLobby()
	const	{ isAuthenticated } = useAuth()
	
	const	navigate = useNavigate()

	const	handleJoin = () => {
		setError(null)
		setLobbyError(null)
		if (!isAuthenticated()) {
			setError('You must be logged in to join a game!')
			return
		}

		if (!inputLobbyId.trim()) {
			setError('Enter lobby ID!')
			return
		}

		if (!/^[A-Z2-9]{6}$/.test(inputLobbyId)) {
			setError('Enter a valid ID!')
			return
		}
		setJoining(true)
		joinLobby(inputLobbyId)
	}

	useEffect(() => {
		setError(null)
		setLobbyError(null)
		if (joining && lobbyId)
			navigate(`/lobby/${lobbyId}`)
	}, [lobbyId, joining])

	return (
		<div className='flex justify-center'>
			<AuthCard title="Join Game" error={error || lobbyError}>
				<div className='mb-5'>
					<AuthField
						label="Game ID"
						name="lobbyId"
						value={inputLobbyId}
						onChange={e => {
							setInputLobbyId(e.target.value.toUpperCase())
							setLobbyError(null)
							setError(null)
						}}
						placeholder="ABC234"
						maxLength={6}
					/>
				</div>
				<button className='w-full rounded-lg border border-purple-mid/60 bg-purple-brand/20 px-5 py-2.5 ext-xs uppercase tracking-ui text-purple-pale transition-all hover:border-purple-str hover:bg-purple-brand/35 hover:shadow-btn-purple' onClick={handleJoin}>Join</button>
			</AuthCard>
		</div>
	)
}

export default JoinGameView
