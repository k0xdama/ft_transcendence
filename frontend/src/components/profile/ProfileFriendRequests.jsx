import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { IconCheck, IconDecline } from '../icons/Icons'
import FriendRow from './FriendRow'
import { PLAYER_ROUTE } from '../../constants/ApiRoutes'
import { transformRequestEntry } from './ProfileUtils'

function ProfileFriendRequests() {
	const { authFetch } = useAuth()
	const [pending, setPending]   = useState([])
	const [sent, setSent]         = useState([])
	const [loading, setLoading]   = useState(true)
	const [error, setError]       = useState('')
	const [sendQuery, setSendQuery] = useState('')
	const [sending, setSending]   = useState(false)

	useEffect(() => { fetchAll() }, [])

	const fetchAll = async () => {
		try {
			const [pendingRes, sentRes] = await Promise.all([
				authFetch(`${PLAYER_ROUTE}/me/friend-requests/pending`),
				authFetch(`${PLAYER_ROUTE}/me/friend-requests/sent`)
			])
			if (!pendingRes.ok || !sentRes.ok) throw new Error()
			const [pendingData, sentData] = await Promise.all([pendingRes.json(), sentRes.json()])
			setPending(pendingData.requests.map(transformRequestEntry))
			setSent(sentData.requests.map(transformRequestEntry))
		} catch {
			setError('Failed to load friend requests')
		} finally {
			setLoading(false)
		}
	}

	const refreshPending = async () => {
		const res = await authFetch(`${PLAYER_ROUTE}/me/friend-requests/pending`)
		if (res.ok) {
			const data = await res.json()
			setPending(data.requests.map(transformRequestEntry))
		}
	}

	const refreshSent = async () => {
		const res = await authFetch(`${PLAYER_ROUTE}/me/friend-requests/sent`)
		if (res.ok) {
			const data = await res.json()
			setSent(data.requests.map(transformRequestEntry))
		}
	}

	const handleAccept = async (id) => {
		try {
			const res = await authFetch(`${PLAYER_ROUTE}/me/friend-requests/${id}/accept`, { method: 'POST' })
			if (!res.ok) throw new Error()
			await refreshPending()
		} catch { setError('Failed to accept friend request') }
	}

	const handleDecline = async (id) => {
		try {
			const res = await authFetch(`${PLAYER_ROUTE}/me/friend-requests/${id}`, { method: 'DELETE' })
			if (!res.ok) throw new Error()
			await refreshPending()
		} catch { setError('Failed to decline friend request') }
	}

	const handleCancel = async (id) => {
		try {
			const res = await authFetch(`${PLAYER_ROUTE}/me/friend-requests/${id}`, { method: 'DELETE' })
			if (!res.ok) throw new Error()
			await refreshSent()
		} catch { setError('Failed to cancel friend request') }
	}

	const handleSend = async () => {
		if (!sendQuery.trim()) return
		setSending(true)
		try {
			const res = await authFetch(`${PLAYER_ROUTE}/me/friend-requests/${sendQuery}`, { method: 'POST' })
			if (!res.ok) throw new Error()
			setSendQuery('')
			await refreshSent()
		} catch { setError('Failed to send friend request') }
		finally { setSending(false) }
	}

	if (loading)
		return <p className="text-xs uppercase tracking-ui text-purple-pale/85 text-center animate-crt-blink m-0 py-6">Loading friend requests...</p>

	const RequestList = ({ items, emptyMsg, renderActions }) => (
		<div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
			{items.length === 0
				? <p className="text-center text-xs uppercase tracking-ui text-purple-pale/40 py-4 m-0">{emptyMsg}</p>
				: items.map(req => (
					<FriendRow
						key={req.id}
						user={req}
						statusLabel={`${req.requestedAt ? new Date(req.requestedAt).toLocaleDateString() : ''}`}
					>
						{renderActions(req)}
					</FriendRow>
				))
			}
		</div>
	)

	return (
		<div className="flex flex-col gap-5">
			{/* Send request */}
			<div className="flex items-center gap-2.5">
				<input
					type="text"
					className="flex-1 px-3 py-2 rounded text-xs uppercase tracking-ui text-white/87 bg-card-input border border-purple-mid/25 placeholder-white/35 focus:outline-none focus:border-purple-mid/50 focus:shadow-lg focus:shadow-purple-brand/15 transition-all"
					placeholder="Send friend request (enter friend's username)..."
					value={sendQuery}
					onChange={e => setSendQuery(e.target.value)}
					onKeyPress={e => e.key === 'Enter' && handleSend()}
				/>
				<button
					className="px-4 py-2 rounded text-xs uppercase tracking-ui text-cyan-glow bg-cyan-glow/8 border border-cyan-glow/50 hover:bg-cyan-glow/18 hover:shadow-lg hover:shadow-cyan-glow/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
					onClick={handleSend}
					disabled={sending || !sendQuery.trim()}
				>
					{sending ? 'Sending...' : 'Send'}
				</button>
			</div>

			{/* Pending */}
			<div className="flex flex-col gap-2.5">
				<h3 className="m-0 text-xs uppercase tracking-ui text-purple-pale">Pending Requests ({pending.length})</h3>
				<RequestList
					items={pending}
					emptyMsg="No pending requests"
					renderActions={req => (
						<>
							<button className="w-7 h-7 rounded border border-green-500/40 bg-green-500/8 text-green-400 text-xs cursor-pointer flex items-center justify-center hover:bg-green-500/18 hover:shadow-lg hover:shadow-green-500/30 transition-all" title="Accept" onClick={() => handleAccept(req.id)}>
								<IconCheck />
							</button>
							<button className="w-7 h-7 rounded border border-red-500/40 bg-red-500/8 text-red-400 text-xs cursor-pointer flex items-center justify-center hover:bg-red-500/18 hover:shadow-lg hover:shadow-red-500/30 transition-all" title="Decline" onClick={() => handleDecline(req.id)}>
								<IconDecline />
							</button>
						</>
					)}
				/>
			</div>

			{/* Sent */}
			<div className="flex flex-col gap-2.5">
				<h3 className="m-0 text-xs uppercase tracking-ui text-purple-pale">Sent Requests ({sent.length})</h3>
				<RequestList
					items={sent}
					emptyMsg="No sent requests"
					renderActions={req => (
						<button className="px-2.5 h-7 rounded border border-orange-500/40 bg-orange-500/8 text-orange-400 text-xs uppercase tracking-ui cursor-pointer flex items-center justify-center hover:bg-orange-500/18 hover:shadow-lg hover:shadow-orange-500/30 transition-all" onClick={() => handleCancel(req.id)}>
							Cancel
						</button>
					)}
				/>
			</div>

			{error && <p className="text-red-500 text-xs text-center m-0">{error}</p>}
		</div>
	)
}

export default ProfileFriendRequests
