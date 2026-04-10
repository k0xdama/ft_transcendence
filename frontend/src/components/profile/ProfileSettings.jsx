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
		<div className="settings-container">
			{message.text && (
				<div className={`settings-message ${message.type}`}>{message.text}</div>
			)}

			<div className="settings-field">
				<label className="settings-label">Username</label>
				<div className="settings-input-row">
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						disabled={editingField !== 'username'}
						className="settings-input"
					/>
					{editingField === 'username' ? (
						<div className="settings-btn-group">
							<button
								className="btn-settings btn-save"
								onClick={() => handleSave('username')}
								disabled={saving}
							>
								{saving ? '...' : 'Save'}
							</button>
							<button
								className="btn-settings btn-cancel-edit"
								onClick={() => handleCancel('username')}
							>
								Cancel
							</button>
						</div>
					) : (
						<button
							className="btn-settings btn-edit"
							onClick={() => setEditingField('username')}
						>
							Edit
						</button>
					)}
				</div>
			</div>

			<div className="settings-field">
				<label className="settings-label">Email</label>
				<div className="settings-input-row">
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						disabled={editingField !== 'email'}
						className="settings-input"
					/>
					{editingField === 'email' ? (
						<div className="settings-btn-group">
							<button
								className="btn-settings btn-save"
								onClick={() => handleSave('email')}
								disabled={saving}
							>
								{saving ? '...' : 'Save'}
							</button>
							<button
								className="btn-settings btn-cancel-edit"
								onClick={() => handleCancel('email')}
							>
								Cancel
							</button>
						</div>
					) : (
						<button
							className="btn-settings btn-edit"
							onClick={() => setEditingField('email')}
						>
							Edit
						</button>
					)}
				</div>
			</div>

			<div className="settings-danger">
				<h3 className="settings-danger-title">Danger Zone</h3>
				<p className="settings-danger-desc">
					Permanently delete your account and all associated data.
				</p>
				<button className="btn-settings btn-delete-account" onClick={onDeleteAccount}>
					Delete Account
				</button>
			</div>
		</div>
	)
}

export default ProfileSettings
