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
		<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50" onClick={onCancel}>
			<div className="bg-opacity-95 border border-red-500/40 rounded-2xl p-8 w-96 max-w-90vw shadow-2xl shadow-red-500/15" onClick={(e) => e.stopPropagation()} style={{backgroundColor: 'rgba(10, 5, 20, 0.95)'}}>
				<h3 className="text-base uppercase tracking-ui text-red-400 text-shadow-purple m-0 mb-4 text-center">Delete Account</h3>
				<p className="text-xs text-purple-pale/70 m-0 mb-3 text-center uppercase tracking-wider">
					This action is permanent and cannot be undone. All your data will be lost.
				</p>
				<p className="text-xs text-purple-pale/70 m-0 mb-3 text-center uppercase tracking-wider">
					Type <span className="text-red-400 font-bold uppercase tracking-title">DELETE</span> to confirm:
				</p>
				<input
					type="text"
					value={confirmText}
					onChange={(e) => setConfirmText(e.target.value)}
					className="w-full px-3.5 py-2.5 rounded text-sm text-center text-white/87 bg-white/6 border border-red-500/30 placeholder-white/35 focus:outline-none focus:border-red-500/50 uppercase tracking-title mb-5 box-border"
					placeholder="Type DELETE"
				/>
				<div className="flex gap-3 justify-center">
					<button className="px-6 py-2.5 rounded text-xs uppercase tracking-ui text-purple-pale/70 bg-white/4 border border-white/15 hover:bg-white/8 transition-all cursor-pointer" onClick={onCancel}>
						Cancel
					</button>
					<button
						className="px-6 py-2.5 rounded text-xs uppercase tracking-ui text-red-400 bg-red-500/15 border border-red-500/50 hover:bg-red-500/30 hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
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
