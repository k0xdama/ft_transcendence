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
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const userData = localStorage.getItem('user')
		const token = localStorage.getItem('accessToken')

		if (userData && token) {
			setUser(JSON.parse(userData))
		}

		setLoading(false)
	}, [])

	const login = (userData, token) => {
		localStorage.setItem('user', userData)
		localStorage.setItem('accessToken', token)
		setUser(userData)
	}

	const logout = () => {
		localStorage.removeItem('user')
		localStorage.removeItem('accessToken')
		setUser(null)
	}

	const isAuthenticated = () => {
		return user !== null && localStorage.getItem('accessToken') !== null
	}

	const value = {
		user,
		login,
		logout,
		isAuthenticated,
		loading
	}

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	)
}
