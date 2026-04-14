// Viewport-sized card used for the user profile page. The outer wrapper adds
// the mobile/desktop top padding + gap; the inner card is the tall translucent panel.
function ProfileCard({ children, className = '' }) {
	return (
		<div className="flex flex-col items-center pt-4 gap-4 w-full px-4 md:pt-10 md:gap-6 md:px-0">
			<div className={`flex flex-col bg-card border border-purple-mid rounded-2xl p-4 w-full max-w-[620px] h-[75vh] backdrop-blur-3xl shadow-card md:p-8 md:h-[62vh] ${className}`}>
				{children}
			</div>
		</div>
	)
}

export default ProfileCard
