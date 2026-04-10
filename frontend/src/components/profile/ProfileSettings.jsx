import { useState } from 'react'

function ProfileSettings({ profileData, onUpdate, onDeleteAccount }) {
	const [username, setUsername] = useState(profileData.username)
	const [email, setEmail] = useState(profileData.email || '')
	const [editingField, setEditingField] = useState(null)
	const [saving, setSaving] = useState(false)
	const [message, setMessage] = useState({ text: '', type: '' })

	const handleSave = async (field) => {
		setSaving(true)
		setMessage({ text: '', type: '' })

		const value = field === 'username' ? username : email
		const result = await onUpdate(field, value)

		if (result.success) {
			setMessage({ text: `${field} updated successfully`, type: 'success' })
			setEditingField(null)
		} else {
			setMessage({ text: result.error || 'Update failed', type: 'error' })
		}
		setSaving(false)
	}

	const handleCancel = (field) => {
		if (field === 'username')
			setUsername(profileData.username)
		if (field === 'email')
			setEmail(profileData.email || '')
		setEditingField(null)
		setMessage({ text: '', type: '' })
	}

	return (
		<div className="flex flex-col gap-5">
			{message.text && (
				<div className={`px-3.5 py-2 rounded text-xs text-center uppercase tracking-wider ${message.type === 'success' ? 'text-green-400 bg-green-500/8 border border-green-500/25' : 'text-red-400 bg-red-500/8 border border-red-500/25'}`}>{message.text}</div>
			)}

			<div className="flex flex-col gap-1.5">
				<label className="text-xs uppercase tracking-ui text-purple-pale/70">Username</label>
				<div className="flex gap-2.5 items-center">
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						disabled={editingField !== 'username'}
						className="flex-1 px-3 py-2 rounded text-sm font-normal text-white/87 bg-white/6 border border-purple-mid/25 focus:outline-none focus:border-purple-mid/50 focus:shadow-lg focus:shadow-purple-brand/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					/>
					{editingField === 'username' ? (
						<div className="flex gap-1.5">
							<button
								className="px-4 py-2 rounded text-xs uppercase tracking-ui text-green-400 bg-green-500/8 border border-green-500/50 hover:bg-green-500/18 hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
								onClick={() => handleSave('username')}
								disabled={saving}
							>
								{saving ? '...' : 'Save'}
							</button>
							<button
								className="px-4 py-2 rounded text-xs uppercase tracking-ui text-purple-pale/60 bg-white/4 border border-white/15 hover:bg-white/8 transition-all cursor-pointer"
								onClick={() => handleCancel('username')}
							>
								Cancel
							</button>
						</div>
					) : (
						<button
							className="px-4 py-2 rounded text-xs uppercase tracking-ui text-cyan-glow bg-cyan-glow/8 border border-cyan-glow/50 hover:bg-cyan-glow/18 hover:shadow-lg hover:shadow-cyan-glow/30 transition-all cursor-pointer"
							onClick={() => setEditingField('username')}
						>
							Edit
						</button>
					)}
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<label className="text-xs uppercase tracking-ui text-purple-pale/70">Email</label>
				<div className="flex gap-2.5 items-center">
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						disabled={editingField !== 'email'}
						className="flex-1 px-3 py-2 rounded text-sm font-normal text-white/87 bg-white/6 border border-purple-mid/25 focus:outline-none focus:border-purple-mid/50 focus:shadow-lg focus:shadow-purple-brand/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
					/>
					{editingField === 'email' ? (
						<div className="flex gap-1.5">
							<button
								className="px-4 py-2 rounded text-xs uppercase tracking-ui text-green-400 bg-green-500/8 border border-green-500/50 hover:bg-green-500/18 hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
								onClick={() => handleSave('email')}
								disabled={saving}
							>
								{saving ? '...' : 'Save'}
							</button>
							<button
								className="px-4 py-2 rounded text-xs uppercase tracking-ui text-purple-pale/60 bg-white/4 border border-white/15 hover:bg-white/8 transition-all cursor-pointer"
								onClick={() => handleCancel('email')}
							>
								Cancel
							</button>
						</div>
					) : (
						<button
							className="px-4 py-2 rounded text-xs uppercase tracking-ui text-cyan-glow bg-cyan-glow/8 border border-cyan-glow/50 hover:bg-cyan-glow/18 hover:shadow-lg hover:shadow-cyan-glow/30 transition-all cursor-pointer"
							onClick={() => setEditingField('email')}
						>
							Edit
						</button>
					)}
				</div>
			</div>

			<div className="mt-4 p-5 border border-red-500/25 rounded-2xl bg-red-500/4">
				<h3 className="text-sm uppercase tracking-ui text-red-400 m-0 mb-2">Danger Zone</h3>
				<p className="text-xs text-purple-pale/50 m-0 mb-4">
					Permanently delete your account and all associated data.
				</p>
				<button className="px-4 py-2 rounded text-xs uppercase tracking-ui text-red-400/70 bg-red-500/10 border border-red-500/50 hover:bg-red-500/25 hover:shadow-lg hover:shadow-red-500/30 transition-all cursor-pointer" onClick={onDeleteAccount}>
					Delete Account
				</button>
			</div>
		</div>
	)
}

export default ProfileSettings
