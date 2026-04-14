import { useState, useEffect } from 'react'

// Detects mobile/tablet game context: phones, iPads, or landscape with short height
// Matches the tailwind md breakpoint (1024px) + landscape phones (height < 500px)
export function useIsMobileGame() {
	const query = '(max-height: 500px), (max-width: 1023px)'
	const [isMobile, setIsMobile] = useState(() => window.matchMedia(query).matches)

	useEffect(() => {
		const mql = window.matchMedia(query)
		const handler = (e) => setIsMobile(e.matches)
		mql.addEventListener('change', handler)
		return () => mql.removeEventListener('change', handler)
	}, [])

	return isMobile
}
