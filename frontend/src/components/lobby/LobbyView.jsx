import { useParams, useNavigate } from 'react-router-dom'
import { useLobby } from '../../context/LobbyContext'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import ChatOverlay from './ChatOverlay-Lobby'
import styles from './LobbyView.module.css'

function LobbyView() {
	const	{ lobbyId } = useParams()
	const	{ lobbyStruct, updateRules, toggleReady, startGame, lobbyError, gameId } = useLobby()
	const	{ user } = useAuth()
	const	[error, setError] = useState(null)
	const	[copied, setCopied] = useState(false)
	const	navigate = useNavigate()
	const	chatSocketRef = useRef(null)

	useEffect(() => {
		console.log('LobbyView useEffect - gameId:', gameId);
		if (gameId)
			navigate(`/game/${gameId}`, { state: { lobbyId } })
	}, [gameId])
 
	if (!lobbyStruct) {
		return (
			<div className={styles.createLobbyView}>
				<div className={styles.lobbyCard}>
					<p className={styles.lobbyCreating}>Creating Lobby...</p>
				</div>
			</div>
		)
	}

	const	isHost = user?.id === lobbyStruct.creatorId
	const	me = lobbyStruct.users.find(u => u.id === user?.id)
	const	allReady = lobbyStruct.users.every(u => u.ready)
	const	isFull = lobbyStruct.users.length === lobbyStruct.rules.maxUsers
 
	const	handleCopy = () => {
		navigator.clipboard.writeText(lobbyId)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}
 
	const handleRuleChange = (key, value) => {
		updateRules(lobbyId, { [key]: value })
	}
 
	const modes = [
		{ value: 'CLASSIC', label: 'Classic', desc: 'Win 3 trios' },
		{ value: 'LINKED', label: 'Linked', desc: 'Win 2 linked trios' }
	]
	const types = [
		{ value: 'SOLO', label: 'Solo' },
		{ value: 'TEAM_UP', label: 'Team Up' }
	]
	const playerOptions = [3, 4, 5, 6]
 
	return (
		<div className={styles.createLobbyView}>
			<div className={styles.lobbyCard}>
				<h2 className={styles.lobbyTitle}>{user.username}'s lobby</h2>
 
				{(error || lobbyError) && <p className={styles.errorMsg}>{error || lobbyError}</p>}
 
				<div className={styles.lobbyCodeRow}>
					<span className={styles.lobbyCode}>{lobbyId}</span>
					<button className={styles.btnCopy} onClick={handleCopy}>
						{copied ? '✓ Copied' : 'Copy'}
					</button>
				</div>
 
				<div className={styles.rulesSection}>
					<div className={styles.lobbySectionLabel}>Game Mode</div>
					<div className={styles.modeOptions}>
						{modes.map(mode => (
							<button
								key={mode.value}
								className={`${styles.modeBtn} ${lobbyStruct.rules.gameMode === mode.value ? styles.modeActive : ''}`}
								onClick={() => isHost && handleRuleChange('gameMode', mode.value)}
								disabled={!isHost}
							>
								<span className={styles.modeName}>{mode.label}</span>
								<span className={styles.modeDesc}>{mode.desc}</span>
							</button>
						))}
					</div>
				</div>
 
				<div className={styles.rulesSection}>
					<div className={styles.lobbySectionLabel}>Game Type</div>
					<div className={styles.typeOptions}>
						{types.map(type => (
							<button
								key={type.value}
								className={`${styles.typeBtn} ${lobbyStruct.rules.gameType === type.value ? styles.typeActive : ''}`}
								onClick={() => isHost && handleRuleChange('gameType', type.value)}
								disabled={!isHost}
							>
								{type.label}
							</button>
						))}
					</div>
				</div>
 
				<div className={styles.rulesSection}>
					<div className={styles.lobbySectionLabel}>Players</div>
					<div className={styles.playerOptions}>
						{playerOptions.map(n => (
							<button
								key={n}
								className={`${styles.playerBtn} ${lobbyStruct.rules.maxUsers === n ? styles.playerActive : ''}`}
								onClick={() => isHost && handleRuleChange('maxUsers', n)}
								disabled={!isHost}
							>
								{n}
							</button>
						))}
					</div>
				</div>
 
				<ul className={styles.playerList}>
					{lobbyStruct.users.map(u => (
						<li key={u.id}>
							<span className={styles.playerName}>
								{u.id === lobbyStruct.creatorId && <span className={styles.crown}>👑 </span>}
								{u.username ?? u.id}
							</span>
							<span className={`${styles.readyBadge} ${u.ready ? styles.readyBadgeReady : styles.readyBadgeNotReady}`}>
								{u.ready ? 'Ready' : 'Not ready'}
							</span>
						</li>
					))}
 
					{Array.from({ length: lobbyStruct.rules.maxUsers - lobbyStruct.users.length }).map((_, i) => (
						<li key={`empty-${i}`} className={styles.playerSlotEmpty}>
							<span className={styles.emptyLabel}>Waiting for player...</span>
						</li>
					))}
				</ul>
 
				<div className={styles.lobbyAction}>
					<button className={styles.btnReady} onClick={() => toggleReady(lobbyId)}>
						{me?.ready ? 'Not Ready' : 'Ready'}
					</button>
					{isHost && (
						<button
							className={styles.btnStart}
							onClick={() => startGame(lobbyId)}
							disabled={!allReady || !isFull}
						>
							Start Game
						</button>
					)}
				</div>
			</div>
			<ChatOverlay socketRef={chatSocketRef} lobbyId={lobbyId} />
		</div>
	)
}

export default LobbyView
