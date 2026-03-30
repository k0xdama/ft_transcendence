import { useParams, useNavigate } from 'react-router-dom'
import { useLobby } from '../../context/LobbyContext'
import { useAuth } from '../../context/AuthContext'
import { useEffect } from 'react'
import './LobbyView.css'

function LobbyView() {
	const	{ lobbyId } = useParams()
	const	{ lobbyStruct, toggleReady, startGame, lobbyError, gameId } = useLobby()
	const	{ user } = useAuth()
	const	navigate = useNavigate()

	useEffect(() => {
		if (gameId) navigate(`/game/${gameId}`)
	}, [gameId])

	if (!lobbyStruct) {
		return <p>Connecting to lobby...</p>
	}

	const	isHost = user?.id === lobbyStruct.creatorId
	const	me = lobbyStruct.users.find(u => u.id === user?.id)
	const	allReady = lobbyStruct.users.every(u => u.ready)
	const	isFull = lobbyStruct.users.length === lobbyStruct.rules.maxUsers

	return (
		<div className='lobby-view'>
			<div className='lobby-card'>
				<h2 className='lobby-title'>{user.id}'s Lobby</h2>

				{lobbyError && <p className='error-msg'>{lobbyError}</p>}

				<div className='lobby-info'>
					<p>Mode: <span>{lobbyStruct.rules.gameMode}</span></p>
					<p>Type: <span>{lobbyStruct.rules.gameType}</span></p>
					<p>Players: <span>{lobbyStruct.users.length} / {lobbyStruct.rules.maxUsers}</span></p>
				</div>

				<ul className='player-list'>
					{lobbyStruct.users.map(u => (
						<li key={u.id}>
							{u.id === lobbyStruct.creatorId && <span>👑 </span>}
							{u.id}
							<span>{u.ready ? ' ✅' : ' ❌'}</span>
						</li>
					))}
				</ul>
				
				<div className='lobby-action'>
					<button className='btn-ready' onClick={() => toggleReady(lobbyId)}>
						{me?.ready ? 'Not Ready' : 'Ready'}
					</button>
					
					{isHost && (
						<button
							className='btn-start'
							onClick={() => startGame(lobbyId)}
							disabled={!allReady || !isFull}
						>
							Start Game
						</button>
					)}
				</div>
			</div>
	
			<ChatOverlay roomId={lobbyId} />

		</div>
	)
}

export default LobbyView
