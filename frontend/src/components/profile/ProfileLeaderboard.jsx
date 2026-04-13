import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function ProfileLeaderboard() {
	const { authFetch, user } = useAuth()
	const navigate = useNavigate()
	const [leaderboard, setLeaderboard] = useState(null)
	const [error, setError] = useState('')

	useEffect(() => {
		const fetchLeaderboard = async () => {
			try {
				const response = await authFetch('/api/players/leaderboard')
				if (!response.ok)
					throw new Error('Failed to fetch leaderboard')
				const data = await response.json()
				setLeaderboard(data)
			} catch (err) {
				console.error('Failed to fetch leaderboard:', err)
				setError('Failed to load leaderboard')
			}
		}
		fetchLeaderboard()
	}, [])

	if (error)
		return <p className="text-red-500 text-xs text-center">{error}</p>

	if (!leaderboard)
		return <p className="text-xs uppercase tracking-ui text-purple-pale/85 text-center animate-crt-blink">Loading leaderboard...</p>

	if (leaderboard.length === 0)
		return <p className="text-xs uppercase tracking-ui text-purple-pale/50 text-center">No players yet</p>

	return (
		<div className="flex flex-col gap-2">
			{leaderboard.map((player, index) => (
				<div
					key={player.auth_user_id}
					onClick={() => navigate(`/profile/${player.auth_user_id}`)}
					className={`flex items-center justify-between p-3 bg-white/4 border rounded-xl cursor-pointer transition-all hover:border-purple-mid ${
						user && player.auth_user_id === user.id
							? 'border-purple-light/50'
							: 'border-purple-dim'
					}`}
				>
					<div className="flex items-center gap-3">
						<span className={`text-sm font-bold w-8 text-center ${
							index === 0 ? 'text-yellow-400' :
							index === 1 ? 'text-gray-300' :
							index === 2 ? 'text-amber-600' :
							'text-purple-pale/50'
						}`}>
							#{index + 1}
						</span>
						<span className="text-sm text-purple-pale/90">{player.username}</span>
					</div>
					<span className="text-sm font-bold text-green-400">{player.won} W</span>
				</div>
			))}
		</div>
	)
}

export default ProfileLeaderboard
