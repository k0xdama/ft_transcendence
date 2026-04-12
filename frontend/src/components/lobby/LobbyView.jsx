import { useParams, useNavigate } from 'react-router-dom'
import { useLobby } from '../../context/LobbyContext'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import ChatOverlay from './ChatOverlay-Lobby'
// import './LobbyView.css'
// import './LobbyView.module.css'

function LobbyView() {
	const	{ lobbyId: urlLobbyId } = useParams()
	const	{ lobbyStruct, connected, lobbyId, updateRules, toggleReady, startGame, lobbyError, gameId, joinLobby, leaveLobby } = useLobby()
	const	{ user } = useAuth()
	const	[error, setError] = useState(null)
	const	[copied, setCopied] = useState(false)
	const	navigate = useNavigate()
	const	gameIdRef = useRef(null);

	useEffect(() => {
		console.log('LobbyView useEffect - gameId:', gameId);
		if (gameId)
			navigate(`/game/${gameId}`, { state: { lobbyId } })
	}, [gameId])

	useEffect(() => {
		gameIdRef.current = gameId;
	}, [gameId]);

	useEffect(() => {
		return () => {
			if (!gameIdRef.current)
				leaveLobby();
		};
	}, []);

	useEffect(() => {
		if (connected && !lobbyStruct && urlLobbyId)
			joinLobby(urlLobbyId);
	}, [connected, lobbyStruct, urlLobbyId]);
 
	if (!lobbyStruct) {
		return (
			<div className="flex flex-col items-center">
				<div className="bg-card border border-purple-mid rounded-2xl py-[2vh] px-[3vh] w-[460px] backdrop-blur-md shadow-card">
					<p className="text-center text-[rgba(200,160,255,0.6)] text-[0.8rem] tracking-title uppercase">Creating Lobby...</p>
				</div>
			</div>
		)
	}

	const	isHost = user?.id === lobbyStruct.creatorId
	const	me = lobbyStruct.users.find(u => u.id === user?.id)
	const	creator = lobbyStruct.users.find(u => u.id === lobbyStruct.creatorId)
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

	const baseBtnStyle = "flex justify-center items-center gap-1 rounded-[10px] border border-purple-dim bg-btn-muted text-[rgba(220,190,255,0.85)] cursor-pointer transition-all duration-200 hover:border-purple-mid hover:bg-[rgba(140,40,200,0.1)] disabled:cursor-default disabled:hover:border-purple-dim disabled:hover:bg-btn-muted disabled:hover:shadow-none"
	const activeBtnStyle = "!border-purple-str !bg-[rgba(140,40,200,0.2)] !shadow-glow-purple"
 
	return (
		<div className="flex flex-col items-center">
			<div className="bg-card border border-purple-mid rounded-2xl py-[2vh] px-[3vh] w-[460px] backdrop-blur-md shadow-card">
				<h2 className="text-[1.1rem] tracking-title uppercase text-purple-pale text-shadow-purple m-0 mb-6 text-center animate-crt-pulse">
					{creator?.username ?? lobbyStruct.creatorId}'s lobby
				</h2>
 
				{(error || lobbyError) && <p className="text-[#ff4466] text-[0.75rem] text-center m-0 mb-4 tracking-[0.05em]">{error || lobbyError}</p>}
 
				<div className="flex items-center justify-center gap-3 mb-6 px-4 py-3 bg-card-input border border-cyan-mid rounded-xl">
					<span className="text-[1.6rem] tracking-code font-bold text-cyan-glow text-shadow-cyan font-mono">
						{lobbyId}
					</span>
					<button 
						className="px-3.5 py-1.5 rounded-md border border-cyan-str bg-btn-cyan text-cyan-glow text-[0.7rem] tracking-ui uppercase cursor-pointer whitespace-nowrap transition-all duration-200 hover:bg-[rgba(0,200,255,0.18)] hover:shadow-btn-cyan" 
						onClick={handleCopy}
					>
						{copied ? '✓ Copied' : 'Copy'}
					</button>
				</div>
 
				<div className="mb-5">
					<div className="m-0 mb-2.5 text-[0.72rem] tracking-ui uppercase text-[rgba(223,213,236,0.7)]">Game Mode</div>
					<div className="flex gap-2.5 justify-center">
						{modes.map(mode => (
							<button
								key={mode.value}
								className={`${baseBtnStyle} flex-col py-3 px-2.5 flex-1 ${lobbyStruct.rules.gameMode === mode.value ? activeBtnStyle : ''}`}
								onClick={() => isHost && handleRuleChange('gameMode', mode.value)}
								disabled={!isHost}
							>
								<span className="text-[0.85rem] font-bold tracking-[0.1em] uppercase text-purple-pale">{mode.label}</span>
								<span className="text-[0.65rem] tracking-[0.05em] text-[rgba(223,213,236,0.5)]">{mode.desc}</span>
							</button>
						))}
					</div>
				</div>
 
				<div className="mb-5">
					<div className="m-0 mb-2.5 text-[0.72rem] tracking-ui uppercase text-[rgba(223,213,236,0.7)]">Game Type</div>
					<div className="flex gap-2.5 justify-center">
						{types.map(type => (
							<button
								key={type.value}
								className={`${baseBtnStyle} flex-row p-2.5 flex-1 ${lobbyStruct.rules.gameType === type.value ? activeBtnStyle : ''}`}
								onClick={() => isHost && handleRuleChange('gameType', type.value)}
								disabled={!isHost}
							>
								{type.label}
							</button>
						))}
					</div>
				</div>
 
				<div className="mb-5">
					<div className="m-0 mb-2.5 text-[0.72rem] tracking-ui uppercase text-[rgba(223,213,236,0.7)]">Players</div>
					<div className="flex gap-2.5 justify-center">
						{playerOptions.map(n => (
							<button
								key={n}
								className={`${baseBtnStyle} flex-row p-2.5 flex-[0_0_48px] h-12 text-base font-bold ${lobbyStruct.rules.maxUsers === n ? activeBtnStyle : ''}`}
								onClick={() => isHost && handleRuleChange('maxUsers', n)}
								disabled={!isHost}
							>
								{n}
							</button>
						))}
					</div>
				</div>
 
				<ul className="list-none p-0 my-5 flex flex-col gap-2 border-t border-purple-dim pt-5">
					{lobbyStruct.users.map(u => (
						<li key={u.id} className="flex items-center justify-between py-2.5 px-3.5 bg-btn-muted border border-purple-dim rounded-lg text-[0.8rem] tracking-[0.05em] text-[rgba(220,190,255,0.85)]">
							<span>
								{u.id === lobbyStruct.creatorId && <span>👑 </span>}
								{u.username ?? u.id}
							</span>
							<span className={`text-[0.65rem] tracking-[0.1em] uppercase py-[3px] px-2 rounded ${u.ready ? 'text-cyan-glow bg-[rgba(0,220,255,0.1)] border border-[rgba(0,220,255,0.3)]' : 'text-[rgba(200,160,255,0.5)] bg-[rgba(180,60,255,0.05)] border border-purple-dim'}`}>
								{u.ready ? 'Ready' : 'Not ready'}
							</span>
						</li>
					))}
 
					{Array.from({ length: lobbyStruct.rules.maxUsers - lobbyStruct.users.length }).map((_, i) => (
						<li key={`empty-${i}`} className="flex items-center justify-between py-2.5 px-3.5 bg-btn-muted border border-purple-dim rounded-lg border-dashed opacity-40">
							<span className="text-[0.7rem] tracking-[0.1em] uppercase text-[rgba(200,160,255,0.5)] w-full text-center">Waiting for player...</span>
						</li>
					))}
				</ul>
 
				<div className="flex gap-3 justify-center">
					<button 
						className="py-2.5 px-7 rounded-lg border border-cyan-str bg-btn-cyan text-cyan-glow tracking-ui uppercase text-[0.75rem] cursor-pointer transition-all duration-200 hover:bg-[rgba(0,200,255,0.18)] hover:shadow-btn-cyan" 
						onClick={() => toggleReady(lobbyId)}
					>
						{me?.ready ? 'Not Ready' : 'Ready'}
					</button>
					{isHost && (
						<button
							className="py-2.5 px-7 rounded-lg border border-purple-str bg-btn-purple text-purple-light tracking-ui uppercase text-[0.75rem] cursor-pointer transition-all duration-200 hover:not-disabled:bg-[rgba(140,40,200,0.3)] hover:not-disabled:shadow-glow-purple disabled:opacity-35 disabled:cursor-not-allowed"
							onClick={() => startGame(lobbyId)}
							disabled={!allReady || !isFull}
						>
							Start Game
						</button>
					)}
				</div>
			</div>
			<ChatOverlay lobbyId={lobbyId} />
		</div>
	)
}

export default LobbyView
