import { useState } from "react"
import { useNavigate } from 'react-router-dom'
import { useLobby } from "../../context/LobbyContext"
import { useAuth } from "../../context/AuthContext"
import './CreateGameView.css'

function CreateGameView() {
	const	[maxUsers, setMaxUsers] = useState(3)
	const	[gameMode, setGameMode] = useState('CLASSIC')
	const	[gameType, setGameType] = useState('SOLO')

	const	{ connect, createLobby } = useLobby()
	const	{ accessToken } = useAuth()
	const	navigate = useNavigate()

	const	handleCreate = () => {
		connect(accessToken, (lobbyId) => {
			navigate(`/lobby/${lobbyId}`)
		})

		createLobby(gameMode, gameType, maxUsers)
	}

	return (
		<div className='createGameView'>
			<div className='createBox'>
				<h2 className='boxTitle'>Create New Game</h2>
				<div className='createInputs'>
					<label className>Players</label>
					<input
						type='number'
						min={3} max={7}
						defaultValue={3}
						className='maxPlayers'
					/>
				</div>

				<div className='createInputs'>
					<label className>Mode</label>
					<select value={gameMode} onChange={e => setGameMode(e.target.value)}>
						<option value='CLASSIC'>Classic</option>
						<option value='LINKED'>Linked</option>
					</select>
				</div>

				<div className='createInputs'>
					<label className>Type</label>
					<select value={gameType} onChange={e => setGameType(e.target.value)}>
						<option value='SOLO'>Solo</option>
						<option value='TEAM_UP'>Team up</option>
					</select>
				</div>

				<button onClick={handleCreate}>Create</button>
			</div>
		</div>
	)
}

export default CreateGameView
