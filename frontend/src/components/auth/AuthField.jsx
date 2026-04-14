function AuthField({ label, name, value, onChange, type = 'text', autoComplete, disabled }) {
	return (
		<div className="flex flex-col items-start gap-1.5">
			<label className="text-xs uppercase tracking-ui text-white/75">{label}</label>
			<input
				name={name}
				value={value}
				onChange={onChange}
				disabled={disabled}
				type={type}
				autoComplete={autoComplete}
				className="w-full rounded-lg border border-purple-dim bg-card-input px-3 py-2 text-sm text-white outline-none transition-colors focus:border-purple-mid"
			/>
		</div>
	)
}

export default AuthField
