import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

function ProfileMatchHistory({ targetUserId }) {
	const { authFetch } = useAuth()
	const [matches, setMatches] = useState(null)
	const [error, setError] = useState('')

	useEffect(() => {
		const fetchHistory = async () => {
			try {
				const response = await authFetch(`/api/players/${targetUserId}/match-history`)
				if (!response.ok)
					throw new Error('Failed to fetch match history')
				const data = await response.json()
				setMatches(data)
			} catch (err) {
				console.error('Failed to fetch match history:', err)
				setError('Failed to load match history')
			}
		}
		fetchHistory()
	}, [targetUserId])

	if (error)
		return <p className="text-red-500 text-xs text-center">{error}</p>

	if (!matches)
		return <p className="text-xs uppercase tracking-ui text-purple-pale/85 text-center animate-crt-blink">Loading history...</p>

	if (matches.length === 0)
		return <p className="text-xs uppercase tracking-ui text-purple-pale/50 text-center">No matches played yet</p>

	return (
		<div className="flex flex-col gap-2">
			{matches.map((match) => (
				<div
					key={`${match.game_id}-${match.played_at}`}
					className={`flex items-center justify-between p-3 bg-white/4 border rounded-xl transition-all ${
						match.won
							? 'border-green-500/30 hover:border-green-500/50'
							: 'border-red-500/30 hover:border-red-500/50'
					}`}
				>
					<div className="flex items-center gap-3">
						<span className={`text-sm font-bold uppercase tracking-ui ${match.won ? 'text-green-400' : 'text-red-400'}`}>
							{match.won ? 'W' : 'L'}
						</span>
						<div className="flex flex-col">
							<span className="text-xs text-purple-pale/80">
								{match.game_mode} - {match.game_type}
							</span>
							<span className="text-[0.6rem] text-white/40">
								{new Date(match.played_at).toLocaleDateString()} {new Date(match.played_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
							</span>
						</div>
					</div>
				</div>
			))}
		</div>
	)
}

export default ProfileMatchHistory
