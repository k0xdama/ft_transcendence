import { useState } from 'react'

function DeleteAccountModal({ onConfirm, onCancel }) {
	const [confirmText, setConfirmText] = useState('')
	const [deleting, setDeleting] = useState(false)

	const handleConfirm = async () => {
		setDeleting(true)
		await onConfirm()
		setDeleting(false)
	}

	return (
		<div className="modal-overlay" onClick={onCancel}>
			<div className="modal-card" onClick={(e) => e.stopPropagation()}>
				<h3 className="modal-title">Delete Account</h3>
				<p className="modal-text">
					This action is permanent and cannot be undone. All your data will be lost.
				</p>
				<p className="modal-text">
					Type <span className="modal-highlight">DELETE</span> to confirm:
				</p>
				<input
					type="text"
					value={confirmText}
					onChange={(e) => setConfirmText(e.target.value)}
					className="modal-input"
					placeholder="Type DELETE"
				/>
				<div className="modal-actions">
					<button className="btn-modal btn-modal-cancel" onClick={onCancel}>
						Cancel
					</button>
					<button
						className="btn-modal btn-modal-confirm"
						onClick={handleConfirm}
						disabled={confirmText !== 'DELETE' || deleting}
					>
						{deleting ? 'Deleting...' : 'Delete My Account'}
					</button>
				</div>
			</div>
		</div>
	)
}

export default DeleteAccountModal
