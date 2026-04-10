import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

function ProfileFriendRequests() {
	const { authFetch } = useAuth()
	const [pendingRequests, setPendingRequests] = useState([])
	const [sentRequests, setSentRequests] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [sendQuery, setSendQuery] = useState('')
	const [sending, setSending] = useState(false)

	useEffect(() => {
		fetchRequests()
	}, [])

	const transformRequest = (req) => ({
		id: req.auth_user_id,
		username: req.username,
		avatarUrl: req.pp_path && req.pp_path !== '/uploads/profilePictures/default_profile_picture.png'
			? `/api/players/${req.auth_user_id}/profile-picture`
			: null,
		requestedAt: req.requested_at
	})

	const fetchRequests = async () => {
		try {
			const [pendingRes, sentRes] = await Promise.all([
				authFetch('/api/players/me/friend-requests/pending'),
				authFetch('/api/players/me/friend-requests/sent')
			])

			if (!pendingRes.ok || !sentRes.ok) {
				throw new Error('Failed to fetch friend requests')
			}

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
		const pendingRes = await authFetch('/api/players/me/friend-requests/pending')
		if (pendingRes.ok) {
			const pendingData = await pendingRes.json()
			setPendingRequests(pendingData.requests.map(transformRequest))
		}
	}

	const fetchSentRequests = async () => {
		const sentRes = await authFetch('/api/players/me/friend-requests/sent')
		if (sentRes.ok) {
			const sentData = await sentRes.json()
			setSentRequests(sentData.requests.map(transformRequest))
		}
	}

	const handleAccept = async (friendId) => {
		try {
			const response = await authFetch(`/api/players/me/friend-requests/${friendId}/accept`, {
				method: 'POST'
			})

			if (!response.ok) {
				throw new Error('Failed to accept friend request')
			}

			await fetchPendingRequests()
		} catch (err) {
			setError('Failed to accept friend request')
			console.error('Error accepting request:', err)
		}
	}

	const handleDecline = async (friendId) => {
		try {
			const response = await authFetch(`/api/players/me/friend-requests/${friendId}`, {
				method: 'DELETE'
			})
			if (!response.ok) {
				throw new Error('Failed to decline friend request')
			}

			await fetchPendingRequests()
		} catch (err) {
			setError('Failed to decline friend request')
			console.error('Error declining request:', err)
		}
	}

	const handleCancel = async (friendId) => {
		try {
			const response = await authFetch(`/api/players/me/friend-requests/${friendId}`, {
				method: 'DELETE'
			})

			if (!response.ok) {
				throw new Error('Failed to cancel friend request')
			}

			await fetchSentRequests()
		} catch (err) {
			setError('Failed to cancel friend request')
			console.error('Error canceling request:', err)
		}
	}

	const handleSendRequest = async () => {
		if (!sendQuery.trim()) return

		setSending(true)
		try {
			// For now, assume sendQuery is username. In real app, might need search first
			// This is a simplification - in practice, you'd search for users first
			const response = await authFetch(`/api/players/me/friend-requests/${sendQuery}`, {
				method: 'POST'
			})
			if (!response.ok) {
				throw new Error('Failed to send friend request')
			}
			setSendQuery('')
			// Refresh sent requests
			const sentRes = await authFetch('/api/players/me/friend-requests/sent')
			if (sentRes.ok) {
				const sentData = await sentRes.json()
				setSentRequests(sentData.requests.map(req => ({
					id: req.auth_user_id,
					username: req.username,
					avatarUrl: req.pp_path && req.pp_path !== '/uploads/profilePictures/default_profile_picture.png' 
						? `/api/players/${req.auth_user_id}/profile-picture` 
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
			<div className="friend-requests-container">
				<p>Loading friend requests...</p>
			</div>
		)
	}

	return (
		<div className="friend-requests-container">
			{/* Send request bar */}
			<div className="friend-requests-header">
				<input
					type="text"
					className="friend-requests-search"
					placeholder="Send friend request (enter friend's username)..."
					value={sendQuery}
					onChange={e => setSendQuery(e.target.value)}
					onKeyPress={e => e.key === 'Enter' && handleSendRequest()}
				/>
				<button 
					className="btn-send-request" 
					onClick={handleSendRequest}
					disabled={sending || !sendQuery.trim()}
				>
					{sending ? 'Sending...' : 'Send'}
				</button>
			</div>

			{/* Pending requests */}
			<div className="friend-requests-section">
				<h3>Pending Requests ({pendingRequests.length})</h3>
				<div className="friend-requests-list">
					{pendingRequests.length === 0 ? (
						<p className="friend-requests-empty">No pending requests</p>
					) : (
						pendingRequests.map(request => (
							<div key={request.id} className="friend-request-item">
								<div className="friend-avatar-wrapper">
									<img
										className="friend-avatar"
										src={request.avatarUrl || '/src/assets/PFP_Default.webp'}
										alt={request.username}
									/>
								</div>
								<div className="friend-info">
									<span className="friend-username">{request.username}</span>
									<span className="friend-request-date">
										Requested {new Date(request.requestedAt).toLocaleDateString()}
									</span>
								</div>
								<div className="friend-actions">
									<button 
										className="btn-friend-action btn-accept-request" 
										title="Accept Request"
										onClick={() => handleAccept(request.id)}
									>
										✓
									</button>
									<button 
										className="btn-friend-action btn-decline-request" 
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
			<div className="friend-requests-section">
				<h3>Sent Requests ({sentRequests.length})</h3>
				<div className="friend-requests-list">
					{sentRequests.length === 0 ? (
						<p className="friend-requests-empty">No sent requests</p>
					) : (
						sentRequests.map(request => (
							<div key={request.id} className="friend-request-item">
								<div className="friend-avatar-wrapper">
									<img
										className="friend-avatar"
										src={request.avatarUrl || '/src/assets/PFP_Default.webp'}
										alt={request.username}
									/>
								</div>
								<div className="friend-info">
									<span className="friend-username">{request.username}</span>
									<span className="friend-request-date">
										Sent {new Date(request.requestedAt).toLocaleDateString()}
									</span>
								</div>
								<div className="friend-actions">
									<button 
										className="btn-friend-action btn-cancel-request" 
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

			{error && <p className="friend-requests-error">{error}</p>}
		</div>

	)
}

export default ProfileFriendRequests