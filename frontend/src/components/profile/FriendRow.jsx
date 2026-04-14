import PFP_Default from '../../assets/PFP_Default.webp'
 
function FriendRow({ user, statusDot, statusLabel, statusColor = 'text-purple-pale/40', children }) {
	const dotColor =
		statusDot === 'online'  ? 'bg-green-400 shadow-lg shadow-green-400/50' :
		statusDot === 'in-game' ? 'bg-cyan-glow shadow-lg shadow-cyan-glow/50' :
		'bg-purple-pale/30'
 
	return (
		<div className="group flex items-center gap-3 px-3.5 py-2.5 bg-white/4 border border-purple-dim rounded-xl hover:border-purple-mid hover:shadow-lg hover:shadow-purple-brand/10 transition-all">
			<div className="relative flex-shrink-0">
				<img
					className="w-9 h-9 rounded-full border-2 border-purple-brand/30 object-cover"
					src={user.avatarUrl || PFP_Default}
					alt={user.username}
				/>
				{statusDot !== undefined && (
					<span className={`absolute bottom-0 right-0.5 w-2.5 h-2.5 rounded-full border-2 border-opacity-90 ${dotColor}`} />
				)}
			</div>
 
			<div className="flex flex-col gap-0.5 flex-1 min-w-0">
				<span className="text-sm font-bold uppercase tracking-wider text-purple-pale truncate">{user.username}</span>
				{statusLabel && (
					<span className={`text-xs uppercase tracking-ui ${statusColor}`}>{statusLabel}</span>
				)}
			</div>
 
			{children && (
				<div className="flex gap-1.5 flex-shrink-0">{children}</div>
			)}
		</div>
	)
}

export default FriendRow
