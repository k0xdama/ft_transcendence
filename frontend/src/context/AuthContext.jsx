import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider')
	}
	return context
}

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const userData = localStorage.getItem('user')
	const [accessToken, setAccessToken] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const	tryRestoreSession = async () => {
			try {
				const	response = await fetch('http://localhost:3000/auth/refresh', {
					method: 'POST',
					credentials: 'include'
				})

				if (response.ok) {
					const data = await response.json()
					setAccessToken(data.accessToken)
					if (userData) setUser(JSON.parse(userData))
				} else {
					localStorage.removeItem('user')
				}
			} catch (err) {
				console.error('Session restore failed:', err)
				localStorage.removeItem('user')
			} finally {
				setLoading(false)
			}
		}
		tryRestoreSession()
	}, [])

	const login = (userData, token) => {
		localStorage.setItem('user', JSON.stringify(userData))
		setAccessToken(token)
		setUser(userData)
	}

	const logout = async () => {
		try {
			await fetch('http://localhost:3000/auth/logout', {
				method: 'POST',
				credentials: 'include'
			})
		} catch (err) {
			console.error('Logout failed:', err)
		} finally {
			localStorage.removeItem('user')
			setAccessToken(null)
			setUser(null)
		}
	}

	const authFetch = async (URL, options = {}) => {
		const response = fetch(url, {
			...options,
			headers: {
				...options.headers,
				'Authorization': `Bearer ${accessToken}`
			}
		})

		if (response.status !== 401) return response

		const refreshResponse = await fetch('http://localhost:3000/auth/refresh', {
			method: 'POST',
			credentials: 'include'
		})

		if (!refreshResponse.ok) {
			logout()
			return response
		}

		const data = await refreshResponse.json()
		const newToken = data.accessToken
		setAccessToken(newToken)

		return fetch(url, {
			...options,
			headers: {
				...options.headers,
				'Authorization': `Bearer ${newToken}`
			}
		})
	}

	const isAuthenticated = () => user !== null && accessToken !== null

	const value = {
		user,
		accessToken,
		login,
		logout,
		isAuthenticated,
		authFetch,
		loading
	}

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}
