import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AUTH_ROUTE } from '../../constants/ApiRoutes';
import AuthField from './AuthField';
import AuthCard from './AuthCard';

function RegisterView() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		username: '',
		email: '',
		password: '',
		confirmPassword:''
	});
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [loading, setLoading] = useState(false);


	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleRegister = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		if (formData.password !== formData.confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		setLoading(true);

		try {
			const res = await fetch(`${AUTH_ROUTE}/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: formData.email,
					username: formData.username,
					password: formData.password
				}),
			});

			const data = await res.json();
			if (!res.ok) {
				setError(data.error || 'Registration failed');
				return;
			}

			setSuccess(data.message)

			setFormData({
				username: '',
				email: '',
				password: '',
				confirmPassword: ''
			});
			
			setTimeout(() => {navigate('/login')}, 1000);
		} catch (error) {
			console.error('Register error:', error);
			setError('Registration failed. Please try again.');
		} finally {
			setLoading(false);
		}
	}

	return (
		<AuthCard title="Create an account" error={error} success={success}>
			<form onSubmit={handleRegister} className='flex flex-col gap-3.5'>
				<AuthField
					label="Username"
					name="username"
					value={formData.username}
					onChange={handleChange}
					disabled={loading}
					autoComplete="username"
				/>
				<AuthField
					label="Email address"
					name="email"
					value={formData.email}
					onChange={handleChange}
					disabled={loading}
					autoComplete="email"
				/>
				<AuthField
					label="Password"
					name="password"
					value={formData.password}
					onChange={handleChange}
					disabled={loading}
					type='password'
					autoComplete="new-password"
				/>
				<AuthField
					label="Confirm password"
					name="confirmPassword"
					value={formData.confirmPassword}
					onChange={handleChange}
					disabled={loading}
					type='password'
					autoComplete="new-password"
				/>
				<button className='mt-2 w-full rounded-lg border border-purple-mid/60 bg-purple-brand/20 px-5 py-2.5 text-xs uppercase tracking-ui text-purple-pale transition-all hover:border-purple-str hover:bg-purple-brand/35 hover:shadow-btn-purple disabled:cursor-not-allowed disabled:opacity-60' type='submit' disabled={loading}>
					{loading ? 'Registering...' : 'Register'}
				</button>
			</form>
			<p className='mt-5 mb-0 text-center text-xs uppercase tracking-ui text-white/70'>
				Already have an account? <Link to="/login" className='text-purple-pale transition-colors hover:text-purple-light'>Sign in</Link>
			</p>
		</AuthCard>
	);
}

export default RegisterView;
