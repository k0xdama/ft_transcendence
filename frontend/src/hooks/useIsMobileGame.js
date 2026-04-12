import { useState, useEffect } from 'react'

// Detects mobile game context: portrait small screen OR landscape phone
// (landscape phones have height < 500px even if width > 768px)
export function useIsMobileGame() {
	const query = '(max-height: 500px), (max-width: 767px)'
	const [isMobile, setIsMobile] = useState(() => window.matchMedia(query).matches)

	useEffect(() => {
		const mql = window.matchMedia(query)
		const handler = (e) => setIsMobile(e.matches)
		mql.addEventListener('change', handler)
		return () => mql.removeEventListener('change', handler)
	}, [])

	return isMobile
}
