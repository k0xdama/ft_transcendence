import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useLobby } from '../../context/LobbyContext';
import { useAuth } from '../../context/AuthContext';
import styles from './LobbyView.module.css'
 
function CreateLobbyView() {
 
	const	{ connected, createLobby, lobbyId, lobbyStruct } = useLobby()
	const	{ user } = useAuth()
	const	navigate = useNavigate()

	useEffect(() => {
		if (connected) createLobby('CLASSIC', 'SOLO', 3)
	}, [connected])

	useEffect(() => {
		if (lobbyId) navigate(`/lobby/${lobbyId}`, { replace: true })
	}, [lobbyId])

	if (!lobbyStruct) {
		return (
			<div className={styles.createLobbyView}>
				<div className={styles.lobbyCard}>
					<p className={styles.lobbyCreating}>Creating Lobby...</p>
				</div>
			</div>
		)
	}
}
export default CreateLobbyView
