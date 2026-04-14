function PageCard({ children, className = '', outerClassName = '' }) {
	return (
		<div className={`flex flex-col items-center w-full px-4 md:px-0 ${outerClassName}`}>
			<div className={`bg-card border border-purple-mid rounded-2xl p-4 md:p-8 w-full max-w-[460px] backdrop-blur-md shadow-card ${className}`}>
				{children}
			</div>
		</div>
	)
}

export default PageCard
