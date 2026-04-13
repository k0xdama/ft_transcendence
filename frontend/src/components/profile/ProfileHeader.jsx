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
	onBlock,
	onSendMessage
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
		<div className="flex flex-col items-center gap-4 pb-6 border-b border-purple-dim mb-6">
			<div className="flex flex-col items-center gap-2">
				<img
					src={profileData.avatarUrl || PFP_Default}
					alt={`${profileData.username}'s avatar`}
					className="w-18 h-18 rounded-full border-4 border-purple-brand shadow-lg shadow-purple-brand/40 md:w-24 md:h-24"
				/>
				{isOwnProfile && (
					<div className="flex gap-2">
						<button
							className="px-3 py-1 rounded text-xs uppercase tracking-ui text-white/70 bg-purple-brand/10 border border-purple-brand/30 hover:bg-purple-brand/25 hover:shadow-lg hover:shadow-purple-brand/30 transition-all"
							onClick={() => fileInputRef.current?.click()}
						>
							Upload
						</button>
						<button
							className="px-3 py-1 rounded text-xs uppercase tracking-ui text-red-400 bg-red-500/8 border border-red-500/30 hover:bg-red-500/15 hover:shadow-lg hover:shadow-red-500/30 transition-all"
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

			<div className="text-center">
				<h2 className="text-2xl uppercase tracking-ui text-purple-pale text-shadow-purple m-0">{profileData.username}</h2>
				<p className="m-0 mt-1 text-xs uppercase tracking-ui text-white/50">
					Joined <span className="text-white/70">{formatDate(profileData.createdAt)}</span>
				</p>
			</div>

			{!isOwnProfile && (
				<div className="flex flex-wrap justify-center gap-2.5">
					{friendStatus === 'none' && (
						<button className="px-5 py-2 rounded text-xs uppercase tracking-ui text-cyan-glow bg-cyan-glow/8 border border-cyan-glow/50 hover:bg-cyan-glow/18 hover:shadow-lg hover:shadow-cyan-glow/30 transition-all cursor-pointer" onClick={onAddFriend}>
							Add friend
						</button>
					)}
					{friendStatus === 'pending' && (
						<button className="px-5 py-2 rounded text-xs uppercase tracking-ui text-white/60 bg-purple-brand/10 border border-purple-brand/30 cursor-not-allowed" disabled>
							Request sent
						</button>
					)}
					{friendStatus === 'friend' && (
						<>
							<button className="px-5 py-2 rounded text-xs uppercase tracking-ui text-purple-pale bg-purple-brand/15 border border-purple-brand/50 hover:bg-purple-brand/25 hover:shadow-lg hover:shadow-purple-brand/30 transition-all cursor-pointer" onClick={onSendMessage}>
								Send message
							</button>
							<button className="px-5 py-2 rounded text-xs uppercase tracking-ui text-orange-400 bg-orange-500/8 border border-orange-500/50 hover:bg-orange-500/18 hover:shadow-lg hover:shadow-orange-500/30 transition-all cursor-pointer" onClick={onRemoveFriend}>
								Remove friend
							</button>
						</>
					)}
					{friendStatus !== 'blocked' && (
						<button className="px-5 py-2 rounded text-xs uppercase tracking-ui text-red-400/70 bg-red-500/8 border border-red-500/50 hover:bg-red-500/18 hover:shadow-lg hover:shadow-red-500/30 transition-all cursor-pointer" onClick={onBlock}>
							Block
						</button>
					)}
					{friendStatus === 'blocked' && (
						<span className="px-5 py-2 text-xs uppercase tracking-ui text-red-400/60">Blocked</span>
					)}
				</div>
			)}
		</div>
	)
}

export default ProfileHeader
