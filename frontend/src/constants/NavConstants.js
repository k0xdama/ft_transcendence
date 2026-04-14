export const LEGAL_LINKS = [
	{ to: '/privacy', label: 'Privacy Policy' },
	{ to: '/terms',   label: 'Terms of Service' }
]

export const AUTH_LINKS = [
	{ to: '/profile',               label: 'Profile' },
	{ to: '/profile?tab=settings',  label: 'Settings' },
	{ to: '/',                      label: 'Home' }
]

export const GUEST_LINKS = [
	{ to: '/login',    label: 'Log in' },
	{ to: '/register', label: 'Register' }
]

// Shared class string for every link/button in the mobile sidebar nav.
export const SIDEBAR_LINK_CLASS =
	'flex items-center gap-3 rounded-lg px-4 py-3 text-[0.8rem] uppercase tracking-ui text-white/80 transition-all hover:bg-purple-brand/15 hover:text-purple-pale'
