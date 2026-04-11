import { useNavigate } from 'react-router-dom'
import { useLobby } from '../../context/LobbyContext'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
// import './JoinGameView.css'

function JoinGameView() {
	const	[inputLobbyId, setInputLobbyId] = useState('')
	const	[error, setError] = useState(null)
	const	{ lobbyId, joinLobby, lobbyError, setLobbyError } = useLobby()
	const	{ isAuthenticated } = useAuth()
	const	navigate = useNavigate()

	const	[joining, setJoining] = useState(false)

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
		if (joining && lobbyId)
			navigate(`/lobby/${lobbyId}`)
	}, [lobbyId, joining])

	return (
		<div className='flex justify-center'>
			<div className='w-[400px] rounded-2xl border border-purple-mid bg-card p-8 shadow-card backdrop-blur-3xl'>
				<h2 className='m-0 mb-6 text-center text-lg uppercase tracking-title text-purple-pale text-shadow-purple'>Join game</h2>
				{(error || lobbyError) && (<p className='m-0 mb-4 text-center text-xs uppercase tracking-ui text-red-400'>{error || lobbyError}</p>)}
				<div className='mb-5 flex flex-col items-start gap-1.5'>
					<label className='text-xs uppercase tracking-ui text-white/75'>Game ID</label>
					<input
						type='text'
						className='w-full rounded-lg border border-purple-dim bg-card-input px-3 py-2 text-sm text-white outline-none transition-colors focus:border-purple-mid'
						placeholder='ABC234'
						maxLength={6}
						value={inputLobbyId}
						onChange={e => {
							setInputLobbyId(e.target.value.toUpperCase())
							setLobbyError(null)
							setError(null)
						}}
					/>
				</div>
				<button className='w-full rounded-lg border border-purple-mid/60 bg-purple-brand/20 px-5 py-2.5 text-xs uppercase tracking-ui text-purple-pale transition-all hover:border-purple-str hover:bg-purple-brand/35 hover:shadow-btn-purple' onClick={handleJoin}>Join</button>
			</div>
		</div>
	)
}

export default JoinGameView
