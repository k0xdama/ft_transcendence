import { useNavigate } from 'react-router-dom'
import { useLobby } from '../../context/LobbyContext'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import './JoinGameView.css'

function JoinGameView() {
	const	[inputLobbyId, setInputLobbyId] = useState('')
	const	[error, setError] = useState(null)
	const	{ connect, joinLobby, lobbyError, setLobbyError } = useLobby()
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
			setError('Enter valid ID!')
			return
		}
		connect(
			() => joinLobby(inputLobbyId),
			(msg) => setError(msg),
			null,
			(lobbyId) => navigate(`/lobby/${lobbyId}`)
		)
	}
	return (
		<div className='joinGameView'>
			<div className='joinBox'>
				<h2 className='boxTitle'>Join Game</h2>
				{(error || lobbyError) && (<p className='error-msg'>{error || lobbyError}</p>)}
				<div className='joinInputs'>
					<label className>Game ID</label>
					<input
						type='text'
						className='gameID' 
						value={inputLobbyId}
						onChange={e => {
							setInputLobbyId(e.target.value)
							setLobbyError(null)
							setError(null)
						}}
					/>
				</div>
				<button onClick={handleJoin}>Join</button>
			</div>
		</div>
	)
}

export default JoinGameView
