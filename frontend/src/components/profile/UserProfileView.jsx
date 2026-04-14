import { useParams, useNavigate, useSearchParams, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useDM } from '../../context/DMContext'
import ProfileHeader from './ProfileHeader'
import ProfileStats from './ProfileStats'
import ProfileAchievements from './ProfileAchievements'
import ProfileFriends from './ProfileFriends'
import ProfileFriendRequests from './ProfileFriendRequests'
import ProfileMatchHistory from './ProfileMatchHistory'
import ProfileLeaderboard from './ProfileLeaderboard'
import ProfileSettings from './ProfileSettings'
import DeleteAccountModal from './DeleteAccountModal'
import ProfileCard from './ProfileCard'
import ProfileTabBar from './ProfileTabBar'
import { PLAYER_ROUTE } from '../../constants/ApiRoutes'
import { VALID_TABS, TABS_ALL, TABS_OWN_ONLY, FRIEND_STATUS } from '../../constants/ProfileConstant'
import { buildAvatarUrl, extractStats } from './ProfileUtils'

function UserProfileView() {
	const { userId } = useParams()
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const { user, isAuthenticated, authFetch, logout, updateUser, bumpAvatarVersion } = useAuth()
	const { openDM } = useDM()

	const isOwnProfile  = !userId || (user && userId === user.id)
	const targetUserId  = userId || (user && user.id)

	const [activeTab, setActiveTab] = useState(() => {
		const tab = searchParams.get('tab')
		return VALID_TABS.includes(tab) ? tab : 'stats'
	})
	const [profileData, setProfileData]   = useState(null)
	const [stats, setStats]               = useState(null)
	const [loading, setLoading]           = useState(true)
	const [error, setError]               = useState('')
	const [friendStatus, setFriendStatus] = useState(null)
	const [showDeleteModal, setShowDeleteModal] = useState(false)

	const tabs = isOwnProfile ? [...TABS_ALL, TABS_OWN_ONLY] : TABS_ALL

	// Sync tab with ?tab= query param
	useEffect(() => {
		const tab = searchParams.get('tab')
		if (tab && VALID_TABS.includes(tab)) setActiveTab(tab)
	}, [searchParams])

	useEffect(() => {
		if (!targetUserId)
			return
		setError('')
		setProfileData(null)
		fetchProfile()
		if (!isOwnProfile) fetchFriendStatus()
	}, [targetUserId])

	// Merged: fetches player data once, derives both profileData and stats
	const fetchProfile = async () => {
		setLoading(true)
		try {
			const res = await authFetch(`${PLAYER_ROUTE}/${targetUserId}`)
			if (!res.ok) throw new Error('Failed to fetch profile')
			const p = await res.json()

			setProfileData({
				id:        p.auth_user_id,
				username:  p.username,
				email:     isOwnProfile ? (user && user.email) : null,
				avatarUrl: buildAvatarUrl(targetUserId, p.pp_path),
				createdAt: p.created_at
			})

			setStats(extractStats(p))
		} catch (err) {
			console.error(err)
			setError('Failed to load profile')
		} finally {
			setLoading(false)
		}
	}

	const fetchFriendStatus = async () => {
		try {
			const [blockedRes, friendsRes, sentRes] = await Promise.all([
				authFetch(`${PLAYER_ROUTE}/me/blocked`),
				authFetch(`${PLAYER_ROUTE}/me/friends`),
				authFetch(`${PLAYER_ROUTE}/me/friend-requests/sent`)
			])

			if (blockedRes?.ok) {
				const { blocked } = await blockedRes.json()
				if (blocked?.some(b => b.auth_user_id === targetUserId)) { setFriendStatus(FRIEND_STATUS.BLOCKED); return }
			}
			if (friendsRes?.ok) {
				const { friends } = await friendsRes.json()
				if (friends?.some(f => f.auth_user_id === targetUserId)) { setFriendStatus(FRIEND_STATUS.FRIEND); return }
			}
			if (sentRes?.ok) {
				const { requests } = await sentRes.json()
				if (requests?.some(r => r.auth_user_id === targetUserId)) { setFriendStatus(FRIEND_STATUS.PENDING); return }
			}
			setFriendStatus(FRIEND_STATUS.NONE)
		} catch {
			setFriendStatus(FRIEND_STATUS.NONE)
		}
	}

	const handleAddFriend = async () => {
		try {
			const res = await authFetch(`${PLAYER_ROUTE}/me/friend-requests/${targetUserId}`, { method: 'POST' })
			if (!res.ok) throw new Error()
			setFriendStatus(FRIEND_STATUS.PENDING)
		} catch { setError('Failed to send friend request') }
	}

	const handleRemoveFriend = async () => {
		try {
			const res = await authFetch(`${PLAYER_ROUTE}/me/friends/${targetUserId}`, { method: 'DELETE' })
			if (!res.ok) throw new Error()
			setFriendStatus(FRIEND_STATUS.NONE)
		} catch { setError('Failed to remove friend') }
	}

	const handleBlock = async () => {
		try {
			const res = await authFetch(`${PLAYER_ROUTE}/me/blocked/${targetUserId}`, { method: 'POST' })
			if (!res.ok) throw new Error()
			setFriendStatus(FRIEND_STATUS.BLOCKED)
		} catch { setError('Failed to block user') }
	}

	const handleAvatarUpload = async (file) => {
		try {
			const formData = new FormData()
			formData.append('profilePicture', file)
			const res = await authFetch(`${PLAYER_ROUTE}/me/profile-picture`, { method: 'POST', body: formData })
			if (!res.ok) throw new Error()
			setProfileData(prev => ({ ...prev, avatarUrl: `${PLAYER_ROUTE}/${user.id}/profile-picture` }))
			bumpAvatarVersion()
		} catch { setError('Failed to upload avatar') }
	}

	const handleAvatarDelete = async () => {
		try {
			const res = await authFetch(`${PLAYER_ROUTE}/me/profile-picture`, { method: 'DELETE' })
			if (!res.ok) throw new Error()
			setProfileData(prev => ({ ...prev, avatarUrl: null }))
			bumpAvatarVersion()
		} catch { setError('Failed to delete avatar') }
	}

	const handleUpdateProfile = async (field, value) => {
		try {
			const res = await authFetch(`${PLAYER_ROUTE}/me`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ [field]: value })
			})
			if (!res.ok) {
				const err = await res.json()
				throw new Error(err.error || 'Failed to update profile')
			}
			const updated = await res.json()
			setProfileData(prev => ({ ...prev, [field]: updated[field] }))
			if (field === 'username') updateUser({ username: updated[field] })
			return { success: true }
		} catch (err) {
			return { success: false, error: err.message }
		}
	}

	const handleDeleteAccount = async () => {
		try {
			const res = await authFetch(`${PLAYER_ROUTE}/me`, { method: 'DELETE' })
			if (!res.ok) throw new Error()
			await logout()
			navigate('/')
		} catch { setError('Failed to delete account') }
	}

	if (!isAuthenticated()) return <Navigate to="/login" />

	if (loading)
		return <ProfileCard><p className="text-xs uppercase tracking-ui text-purple-pale/85 text-center animate-crt-blink">Loading profile...</p></ProfileCard>

	if (error && !profileData)
		return <ProfileCard><p className="text-red-500 text-xs text-center mt-2">{error}</p></ProfileCard>

	return (
		<>
			<ProfileCard>
				<ProfileHeader
					profileData={profileData}
					isOwnProfile={isOwnProfile}
					friendStatus={friendStatus}
					onAvatarUpload={handleAvatarUpload}
					onAvatarDelete={handleAvatarDelete}
					onAddFriend={handleAddFriend}
					onRemoveFriend={handleRemoveFriend}
					onBlock={handleBlock}
					onSendMessage={() => openDM(targetUserId, profileData.username, profileData.avatarUrl)}
				/>

				<ProfileTabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

				<div className="profile-scrollbar flex-1 min-h-0 overflow-y-auto pr-2">
					{activeTab === 'stats'          && <ProfileStats stats={stats} />}
					{activeTab === 'history'        && <ProfileMatchHistory targetUserId={targetUserId} />}
					{activeTab === 'achievements'   && <ProfileAchievements stats={stats} />}
					{activeTab === 'leaderboard'    && <ProfileLeaderboard />}
					{activeTab === 'friends'        && <ProfileFriends />}
					{activeTab === 'friend-requests'&& <ProfileFriendRequests />}
					{activeTab === 'settings' && isOwnProfile && (
						<ProfileSettings
							profileData={profileData}
							onUpdate={handleUpdateProfile}
							onDeleteAccount={() => setShowDeleteModal(true)}
						/>
					)}
				</div>

				{error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
			</ProfileCard>

			{showDeleteModal && (
				<DeleteAccountModal
					onConfirm={handleDeleteAccount}
					onCancel={() => setShowDeleteModal(false)}
				/>
			)}
		</>
	)
}

export default UserProfileView
