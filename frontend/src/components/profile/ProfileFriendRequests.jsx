import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import PFP_Default from '../../assets/PFP_Default.webp'

function ProfileFriendRequests() {
	const { authFetch } = useAuth()
	const [pendingRequests, setPendingRequests] = useState([])
	const [sentRequests, setSentRequests] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [sendQuery, setSendQuery] = useState('')
	const [sending, setSending] = useState(false)
	const playerRoute = '/api/players'

	useEffect(() => {
		fetchRequests()
	}, [])

	const transformRequest = (req) => ({
		id: req.auth_user_id,
		username: req.username,
		avatarUrl: req.pp_path && req.pp_path !== '/uploads/profilePictures/default_profile_picture.png'
			? `${playerRoute}/${req.auth_user_id}/profile-picture`
			: null,
		requestedAt: req.requested_at
	})

	const fetchRequests = async () => {
		try {
			const [pendingRes, sentRes] = await Promise.all([
				authFetch(`${playerRoute}/me/friend-requests/pending`),
				authFetch(`${playerRoute}/me/friend-requests/sent`)
			])

			if (!pendingRes.ok || !sentRes.ok)
				throw new Error('Failed to fetch friend requests')

			const pendingData = await pendingRes.json()
			const sentData = await sentRes.json()

			setPendingRequests(pendingData.requests.map(transformRequest))
			setSentRequests(sentData.requests.map(transformRequest))
		} catch (err) {
			setError('Failed to load friend requests')
			console.error('Error fetching requests:', err)
		} finally {
			setLoading(false)
		}
	}

	const fetchPendingRequests = async () => {
		const pendingRes = await authFetch(`${playerRoute}/me/friend-requests/pending`)
		if (pendingRes.ok) {
			const pendingData = await pendingRes.json()
			setPendingRequests(pendingData.requests.map(transformRequest))
		}
	}

	const fetchSentRequests = async () => {
		const sentRes = await authFetch(`${playerRoute}/me/friend-requests/sent`)
		if (sentRes.ok) {
			const sentData = await sentRes.json()
			setSentRequests(sentData.requests.map(transformRequest))
		}
	}

	const handleAccept = async (friendId) => {
		try {
			const response = await authFetch(`${playerRoute}/me/friend-requests/${friendId}/accept`, {
				method: 'POST'
			})
			if (!response.ok)
				throw new Error('Failed to accept friend request')

			await fetchPendingRequests()
		} catch (err) {
			setError('Failed to accept friend request')
			console.error('Error accepting request:', err)
		}
	}

	const handleDecline = async (friendId) => {
		try {
			const response = await authFetch(`${playerRoute}/me/friend-requests/${friendId}`, {
				method: 'DELETE'
			})
			if (!response.ok)
				throw new Error('Failed to decline friend request')

			await fetchPendingRequests()
		} catch (err) {
			setError('Failed to decline friend request')
			console.error('Error declining request:', err)
		}
	}

	const handleCancel = async (friendId) => {
		try {
			const response = await authFetch(`${playerRoute}/me/friend-requests/${friendId}`, {
				method: 'DELETE'
			})
			if (!response.ok)
				throw new Error('Failed to cancel friend request')

			await fetchSentRequests()
		} catch (err) {
			setError('Failed to cancel friend request')
			console.error('Error canceling request:', err)
		}
	}

	const handleSendRequest = async () => {
		if (!sendQuery.trim())
			return

		setSending(true)
		try {
			const response = await authFetch(`${playerRoute}/me/friend-requests/${sendQuery}`, {
				method: 'POST'
			})
			if (!response.ok)
				throw new Error('Failed to send friend request')

			setSendQuery('')
			// Refresh sent requests
			const sentRes = await authFetch(`${playerRoute}/me/friend-requests/sent`)
			if (sentRes.ok) {
				const sentData = await sentRes.json()
				setSentRequests(sentData.requests.map(req => ({
					id: req.auth_user_id,
					username: req.username,
					avatarUrl: req.pp_path && req.pp_path !== '/uploads/profilePictures/default_profile_picture.png' 
						? `${playerRoute}/${req.auth_user_id}/profile-picture` 
						: null,
					requestedAt: req.requested_at
				})))
			}
		} catch (err) {
			setError('Failed to send friend request')
			console.error('Error sending request:', err)
		} finally {
			setSending(false)
		}
	}

	if (loading) {
		return (
			<div className="flex flex-col gap-5">
				<p className="text-xs uppercase tracking-ui text-purple-pale/85 text-center animate-crt-blink m-0 py-6">Loading friend requests...</p>
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-5">
			{/* Send request bar */}
			<div className="flex items-center gap-2.5">
				<input
					type="text"
					className="flex-1 px-3 py-2 rounded text-xs uppercase tracking-ui text-white/87 bg-card-input border border-purple-mid/25 placeholder-white/35 focus:outline-none focus:border-purple-mid/50 focus:shadow-lg focus:shadow-purple-brand/15 transition-all"
					placeholder="Send friend request (enter friend's username)..."
					value={sendQuery}
					onChange={e => setSendQuery(e.target.value)}
					onKeyPress={e => e.key === 'Enter' && handleSendRequest()}
				/>
				<button 
					className="px-4 py-2 rounded text-xs uppercase tracking-ui text-cyan-glow bg-cyan-glow/8 border border-cyan-glow/50 hover:bg-cyan-glow/18 hover:shadow-lg hover:shadow-cyan-glow/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer" 
					onClick={handleSendRequest}
					disabled={sending || !sendQuery.trim()}
				>
					{sending ? 'Sending...' : 'Send'}
				</button>
			</div>

			{/* Pending requests */}
			<div className="flex flex-col gap-2.5">
				<h3 className="m-0 text-xs uppercase tracking-ui text-purple-pale">Pending Requests ({pendingRequests.length})</h3>
				<div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
					{pendingRequests.length === 0 ? (
						<p className="text-center text-xs uppercase tracking-ui text-purple-pale/40 py-4 m-0">No pending requests</p>
					) : (
						pendingRequests.map(request => (
							<div key={request.id} className="flex items-center gap-3 px-3.5 py-2.5 bg-white/4 border border-purple-dim rounded-xl hover:border-purple-mid hover:shadow-lg hover:shadow-purple-brand/10 transition-all">
								<div className="relative flex-shrink-0">
									<img
										className="w-9 h-9 rounded-full border-2 border-purple-brand/30 object-cover"
										src={request.avatarUrl || PFP_Default}
										alt={request.username}
									/>
								</div>
								<div className="flex flex-col gap-0.5 flex-1 min-w-0">
									<span className="text-sm font-bold uppercase tracking-wider text-purple-pale truncate">{request.username}</span>
									<span className="text-xs uppercase tracking-ui text-purple-pale/50">
										Requested {new Date(request.requestedAt).toLocaleDateString()}
									</span>
								</div>
								<div className="flex gap-1.5 flex-shrink-0">
									<button 
										className="w-7 h-7 rounded border border-green-500/40 bg-green-500/8 text-green-400 text-xs cursor-pointer flex items-center justify-center hover:bg-green-500/18 hover:shadow-lg hover:shadow-green-500/30 transition-all" 
										title="Accept Request"
										onClick={() => handleAccept(request.id)}
									>
										✓
									</button>
									<button 
										className="w-7 h-7 rounded border border-red-500/40 bg-red-500/8 text-red-400 text-xs cursor-pointer flex items-center justify-center hover:bg-red-500/18 hover:shadow-lg hover:shadow-red-500/30 transition-all" 
										title="Decline Request"
										onClick={() => handleDecline(request.id)}
									>
										✗
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			{/* Sent requests */}
			<div className="flex flex-col gap-2.5">
				<h3 className="m-0 text-xs uppercase tracking-ui text-purple-pale">Sent Requests ({sentRequests.length})</h3>
				<div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
					{sentRequests.length === 0 ? (
						<p className="text-center text-xs uppercase tracking-ui text-purple-pale/40 py-4 m-0">No sent requests</p>
					) : (
						sentRequests.map(request => (
							<div key={request.id} className="flex items-center gap-3 px-3.5 py-2.5 bg-white/4 border border-purple-dim rounded-xl hover:border-purple-mid hover:shadow-lg hover:shadow-purple-brand/10 transition-all">
								<div className="relative flex-shrink-0">
									<img
										className="w-9 h-9 rounded-full border-2 border-purple-brand/30 object-cover"
										src={request.avatarUrl || PFP_Default}
										alt={request.username}
									/>
								</div>
								<div className="flex flex-col gap-0.5 flex-1 min-w-0">
									<span className="text-sm font-bold uppercase tracking-wider text-purple-pale truncate">{request.username}</span>
									<span className="text-xs uppercase tracking-ui text-purple-pale/50">
										Sent {new Date(request.requestedAt).toLocaleDateString()}
									</span>
								</div>
								<div className="flex gap-1.5 flex-shrink-0">
									<button 
										className="px-2.5 h-7 rounded border border-orange-500/40 bg-orange-500/8 text-orange-400 text-xs uppercase tracking-ui cursor-pointer flex items-center justify-center hover:bg-orange-500/18 hover:shadow-lg hover:shadow-orange-500/30 transition-all" 
										title="Cancel Request"
										onClick={() => handleCancel(request.id)}
									>
										Cancel
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			{error && <p className="text-red-500 text-xs text-center m-0">{error}</p>}
		</div>

	)
}

export default ProfileFriendRequests
