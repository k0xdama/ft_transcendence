const BASE = 'shrink-0 !rounded-none !bg-transparent !border-0 border-b-2 border-b-transparent px-3 py-2 text-[0.64rem] uppercase tracking-ui cursor-pointer transition-colors whitespace-nowrap focus:outline-none focus-visible:outline-none'
const ACTIVE = 'border-b-purple-light text-purple-pale text-shadow-purple'
const INACTIVE = 'text-purple-pale/50 hover:text-purple-pale/85'
 
function ProfileTabBar({ tabs, activeTab, onTabChange }) {
	return (
		<div className="mb-5 flex w-full overflow-x-auto gap-1 border-b border-purple-dim pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
			{tabs.map(({ key, label }) => (
				<button
					key={key}
					className={`${BASE} ${activeTab === key ? ACTIVE : INACTIVE}`}
					onClick={() => onTabChange(key)}
				>
					{label}
				</button>
			))}
		</div>
	)
}
 
export default ProfileTabBar
