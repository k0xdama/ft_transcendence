import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { useLobby } from '../../context/LobbyContext';
import { useAuth } from '../../context/AuthContext';
 
function CreateLobbyView() {
 
	const	{ connected, createLobby, lobbyId, lobbyStruct } = useLobby()
	const	{ user } = useAuth()
	const	navigate = useNavigate()

	useEffect(() => {
		if (connected)
			createLobby('CLASSIC', 'SOLO', 3)
	}, [connected])

	useEffect(() => {
		if (lobbyId)
			navigate(`/lobby/${lobbyId}`, { replace: true })
	}, [lobbyId])

	if (!lobbyStruct) {
		return (
			<div className="flex flex-col items-center">
				<div className="bg-[rgba(10,5,20,0.75)] border border-[rgba(180,60,255,0.4)] rounded-[16px] p-[2vh_3vh] w-[460px] backdrop-blur-[12px] shadow-card">
					<p className="text-center text-[rgba(200,160,255,0.6)] text-[0.8rem] tracking-[0.15em] uppercase">Creating Lobby...</p>
				</div>
			</div>
		)
	}
}
export default CreateLobbyView
