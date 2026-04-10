import PFP_Default from '../../assets/PFP_Default.webp'
import { useRef } from 'react'

function ProfileHeader({
	profileData,
	isOwnProfile,
	friendStatus,
	onAvatarUpload,
	onAvatarDelete,
	onAddFriend,
	onRemoveFriend,
	onBlock
}) {
	const fileInputRef = useRef(null)

	const handleFileSelect = (e) => {
		const file = e.target.files[0]
		if (file)
			onAvatarUpload(file)
	}

	const formatDate = (dateStr) => {
		const date = new Date(dateStr)
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	}

	return (
		<div className="profile-header">
			<div className="profile-avatar-wrapper">
				<img
					src={profileData.avatarUrl || PFP_Default}
					alt={`${profileData.username}'s avatar`}
					className="profile-avatar"
				/>
				{isOwnProfile && (
					<div className="avatar-actions">
						<button
							className="btn-avatar"
							onClick={() => fileInputRef.current?.click()}
						>
							Upload
						</button>
						<button
							className="btn-avatar btn-avatar-delete"
							onClick={onAvatarDelete}
						>
							Remove
						</button>
						<input
							type="file"
							ref={fileInputRef}
							onChange={handleFileSelect}
							accept="image/*"
							hidden
						/>
					</div>
				)}
			</div>

			<div className="profile-info">
				<h2 className="profile-username">{profileData.username}</h2>
				<p className="profile-joined">
					Joined <span>{formatDate(profileData.createdAt)}</span>
				</p>
			</div>

			{!isOwnProfile && (
				<div className="profile-social-actions">
					{friendStatus === 'none' && (
						<button className="btn-social btn-add-friend" onClick={onAddFriend}>
							Add Friend
						</button>
					)}
					{friendStatus === 'pending' && (
						<button className="btn-social btn-pending" disabled>
							Request Sent
						</button>
					)}
					{friendStatus === 'friend' && (
						<button className="btn-social btn-remove-friend" onClick={onRemoveFriend}>
							Remove Friend
						</button>
					)}
					{friendStatus !== 'blocked' && (
						<button className="btn-social btn-block" onClick={onBlock}>
							Block
						</button>
					)}
					{friendStatus === 'blocked' && (
						<span className="blocked-label">Blocked</span>
					)}
				</div>
			)}
		</div>
	)
}

export default ProfileHeader
