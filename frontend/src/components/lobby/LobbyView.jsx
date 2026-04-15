import { useParams, useNavigate } from 'react-router-dom'
import { useLobby } from '../../context/LobbyContext'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect, useRef } from 'react'
import ChatOverlay from './ChatOverlay-Lobby'
import PageCard from './PageCard'
import RuleSelector from './RuleSelector'

const baseBtnStyle = "flex justify-center items-center gap-1 rounded-[10px] border border-purple-dim bg-btn-muted text-[rgba(220,190,255,0.85)] cursor-pointer transition-all duration-200 hover:border-purple-mid hover:bg-[rgba(140,40,200,0.1)] disabled:cursor-default disabled:hover:border-purple-dim disabled:hover:bg-btn-muted disabled:hover:shadow-none"
const activeBtnStyle = "!border-purple-str !bg-[rgba(140,40,200,0.2)] !shadow-glow-purple"

function LobbyView() {
	const	{ lobbyId: urlLobbyId } = useParams()
	const	{ lobbyStruct, connected, lobbyId, updateRules, toggleReady, startGame, lobbyError, setLobbyError, gameId, joinLobby, leaveLobby } = useLobby()
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
		setError('');
		setLobbyError('');
		if (connected && !lobbyStruct && urlLobbyId)
			joinLobby(urlLobbyId);
	}, [connected, lobbyStruct, urlLobbyId]);
 
	if (!lobbyStruct) {
		return (
			<PageCard>
				<p className="text-center text-[rgba(200,160,255,0.6)] text-[0.8rem] tracking-title uppercase">Creating Lobby...</p>
			</PageCard>
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

	return (
		<div className="flex flex-col items-center w-full">
			<PageCard>
					{creator?.username ?? lobbyStruct.creatorId}'s lobby
				<h2 className="text-[1.1rem] tracking-title uppercase text-purple-pale text-shadow-purple m-0 mb-6 text-center animate-crt-pulse">
				</h2>
 
				{(error || lobbyError) && <p className="text-[#ff4466] text-[0.75rem] text-center m-0 mb-4 tracking-[0.05em]">{error || lobbyError}</p>}
 
				<div className="flex items-center justify-center gap-2 mb-6 px-3 py-3 bg-card-input border border-cyan-mid rounded-xl md:gap-3 md:px-4">
					<span className="text-[1.1rem] tracking-code font-bold text-cyan-glow text-shadow-cyan font-mono md:text-[1.6rem]">
						{lobbyId}
					</span>
					<button 
						className="px-3.5 py-1.5 rounded-md border border-cyan-str bg-btn-cyan text-cyan-glow text-[0.7rem] tracking-ui uppercase cursor-pointer whitespace-nowrap transition-all duration-200 hover:bg-[rgba(0,200,255,0.18)] hover:shadow-btn-cyan" 
						onClick={handleCopy}
					>
						{copied ? '✓ Copied' : 'Copy'}
					</button>
				</div>
 
				<RuleSelector
					gameMode={lobbyStruct.rules.gameMode}
					maxUsers={lobbyStruct.rules.maxUsers}
					onModeChange={value => isHost && updateRules(lobbyId, { gameMode: value })}
					onPlayerChange={value => isHost && updateRules(lobbyId, { maxUsers: value })}//enleve le s a plyers
					disabled={!isHost}
					modeBaseClass={`${baseBtnStyle} flex-col py-3 px-2.5 flex-1`}
					modeActiveClass={activeBtnStyle}
					playerBaseClass={`${baseBtnStyle} flex-row p-2.5 flex-[0_0_48px] h-12 text-base font-bold`}
					playerActiveClass={activeBtnStyle}
				/>
 
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
			</PageCard>
			<ChatOverlay lobbyId={lobbyId} />
		</div>
	)
}

export default LobbyView
