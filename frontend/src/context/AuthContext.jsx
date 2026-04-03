import { createContext, useContext, useState, useRef, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider');
	}
	return context;
}

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const refreshPromiseRef = useRef(null);
	const authUrl = '/api/auth';

	useEffect(() => {
		const tryRestoreSession = async () => {
			try {
				const res = await fetch(`${authUrl}/refresh`, {
					method: 'POST',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' }
				});

				if (res.ok) {
					const data = await res.json();
					localStorage.setItem('user', JSON.stringify(data.user));
					setUser(data.user);
				} else {
					localStorage.removeItem('user');
				}
			} catch (err) {
				console.error('Session restore failed:', err);
				localStorage.removeItem('user');
			} finally {
				setLoading(false);
			}
		}
		tryRestoreSession();
	}, [])

	const login = (userData) => {
		localStorage.setItem('user', JSON.stringify(userData));
		setUser(userData);
	}

	const logout = async () => {
		try {
			await fetch(`${authUrl}/logout`, {
				method: 'POST',
				credentials: 'include'
			});
		} catch (err) {
			console.error('Logout failed:', err);
		} finally {
			localStorage.removeItem('user');
			setUser(null);
		}
	}

	// Wrapper for authenticated requests — cookies handle the token automatically
	const authFetch = async (URL, options = {}) => {
		const res = await fetch(URL, {
			...options,
			credentials: 'include',
			headers: { ...options.headers }
		});

		if (res.status !== 401)
			return res

		// One refresh at a time
		if (!refreshPromiseRef.current) {
			refreshPromiseRef.current = fetch(`${authUrl}/refresh`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const refreshResponse = await refreshPromiseRef.current;
		refreshPromiseRef.current = null;

		if (!refreshResponse.ok) {
			logout();
			return res;
		}

		// Refresh succeeded — new accessToken cookie is set automatically
		// Retry the original request
		return await fetch(URL, {
			...options,
			credentials: 'include',
			headers: { ...options.headers }
		});
	}

	const isAuthenticated = () => user !== null;

	const value = {
		user,
		login,
		logout,
		isAuthenticated,
		authFetch,
		loading
	};

	return (
		<AuthContext.Provider value={value}>
			{loading ? null : children}
		</AuthContext.Provider>
	);
}
