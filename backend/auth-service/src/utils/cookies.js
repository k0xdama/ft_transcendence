export const REFRESH_COOKIE_OPTIONS = {
	httpOnly: true,
	secure: false,						// set a true quand SSL termination OK (API Gateway)
	sameSite: 'strict',					// cookie sent only to our domain
	path: '/auth',						// cookie sent only on /auth/* routes
	maxAge: 7 * 24 * 60 * 60 * 1000		// 7 days, 24h, 60min, 60s, 1000ms
};

export function setRefreshCookie(res, token) {
	res.cookie('refreshToken', token, REFRESH_COOKIE_OPTIONS);
}

export function clearRefreshCookie(res) {
	res.clearCookie('refreshToken', {
		httpOnly: true,
		secure: false,					// set a true après
		sameSite: 'strict',
		path: '/auth'
	});
}