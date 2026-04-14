function AuthCard({ title, error, success, children }) {
	return (
		<div className="w-full max-w-[400px] rounded-2xl border border-purple-mid bg-card p-6 shadow-card backdrop-blur-3xl md:p-8">
			<h2 className="m-0 mb-6 text-center text-lg uppercase tracking-title text-purple-pale text-shadow-purple">
				{title}
			</h2>
			{error   && <p className="mb-4 text-center text-xs uppercase tracking-ui text-red-400">{error}</p>}
			{success && <p className="mb-4 text-center text-xs uppercase tracking-ui text-green-400">{success}</p>}
			{children}
		</div>
	)
}

export default AuthCard
