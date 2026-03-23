import { useNavigate } from 'react-router-dom'
import './JoinGameView.css'
import { useLobby } from '../../context/LobbyContext'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

function JoinGameView() {
	const	[inputLobbyId, setInputLobbyId] = useState('')
	const	{ connect, joinLobby } = useLobby()
	const	{ accessToken } = useAuth()
	const	navigate = useNavigate()

	const	handleJoin = () => {
		connect(accessToken, null, (lobbyId) => {
			navigate(`/lobby/${lobbyId}`)
		})

		joinLobby(inputLobbyId)
	}
	return (
		<div className='joinGameView'>
			<div className='joinBox'>
				<h2 className='boxTitle'>Join Game</h2>
				<div className='joinInputs'>
					<label className>Game ID</label>
					<input
						type='text'
						className='gameID' 
						value={inputLobbyId}
						onChange={e => setInputLobbyId(e.target.value)}
					/>
				</div>
				<button onClick={handleJoin}>Join</button>
			</div>
		</div>
	)
}

export default JoinGameView
