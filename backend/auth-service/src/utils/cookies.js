export const ACCESS_COOKIE_OPTIONS = {
	httpOnly: true,
	secure: false,
	sameSite: 'strict',					// cookie sent only to our domain
	path: '/',							// sent on all routes (needed by API Gateway authGuard)
	maxAge: 15 * 60 * 1000				// 15 minutes
};

export const REFRESH_COOKIE_OPTIONS = {
	httpOnly: true,
	secure: false,
	sameSite: 'strict',
	path: '/api/auth',					// cookie sent only on /api/auth/* routes
	maxAge: 7 * 24 * 60 * 60 * 1000		// 7 days
};

export function setAccessCookie(res, token) {
	res.cookie('access_token', token, ACCESS_COOKIE_OPTIONS);
}

export function clearAccessCookie(res) {
	const { maxAge, ...clearOptions } = ACCESS_COOKIE_OPTIONS;
	res.clearCookie('access_token', clearOptions);
}

export function setRefreshCookie(res, token) {
	res.cookie('refreshToken', token, REFRESH_COOKIE_OPTIONS);
}

export function clearRefreshCookie(res) {
	const { maxAge, ...clearOptions } = REFRESH_COOKIE_OPTIONS;
	res.clearCookie('refreshToken', clearOptions);
}
