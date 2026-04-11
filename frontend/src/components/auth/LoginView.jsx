import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
// import './LoginView.css'

function LoginView() {
	const navigate = useNavigate();
	const { login } = useAuth();

	const [formData, setFormData] = useState({
		id: '',
		password: '',
	});

	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [loading, setLoading] = useState(false);
	const authRoute = '/api/auth';

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleLogin = async (e) => {
		e.preventDefault();

		if (!formData.password || !formData.id)
		{
			setError('Please enter username/email and password');
			return;
		}

		setLoading(true);

		try {
			const res = await fetch(`${authRoute}/login`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					identifier: formData.id,
					password: formData.password
				}),
			});

			const raw = await res.text();
			let data = {};

			if (raw) {
				try {
					data = JSON.parse(raw);
				} catch {
					data = { error: raw, message: raw };
				}
			}

			if (!res.ok) {
				if (res.status === 401)
					setError(data.error || 'Invalid credentials');
				else if (res.status >= 500)
					setError(data.error || 'Server error. Please try again.');
				else
					setError(data.error || 'Log in failed');
				return;
			}

			if (!data.user) {
				setError('Unexpected server response. Please try again.');
				return;
			}

			setSuccess(data.message || 'Login successful');

			login(data.user);

			setFormData({
				id: '',
				password: ''
			});
			
			setTimeout(() => {navigate('/')}, 1000);
		} catch (error) {
			console.error('Log in error:', error);
			setError('Log in failed. Please try again.');
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className='w-[400px] rounded-2xl border border-purple-mid bg-card p-8 shadow-card backdrop-blur-3xl'>
			<h2 className='m-0 mb-6 text-center text-lg uppercase tracking-title text-purple-pale text-shadow-purple'>Log in</h2>
			{error && <p className='mb-4 text-center text-xs uppercase tracking-ui text-red-400'>{error}</p>}
			{success && <p className='mb-4 text-center text-xs uppercase tracking-ui text-green-400'>{success}</p>}
			<form onSubmit={handleLogin} className='flex flex-col gap-4'>
				<div className='flex flex-col items-start gap-1.5'>
					<label className='text-xs uppercase tracking-ui text-white/75'>Username or email</label>
					<input name='id' value={formData.id} onChange={handleChange} disabled={loading} type="text" className='w-full rounded-lg border border-purple-dim bg-card-input px-3 py-2 text-sm text-white outline-none transition-colors focus:border-purple-mid' autoComplete="username" />
				</div>
				<div className='flex flex-col items-start gap-1.5'>
					<label className='text-xs uppercase tracking-ui text-white/75'>Password</label>
					<input name='password' value={formData.password} onChange={handleChange} disabled={loading} type="password" className='w-full rounded-lg border border-purple-dim bg-card-input px-3 py-2 text-sm text-white outline-none transition-colors focus:border-purple-mid' autoComplete='current-password' />
				</div>
				<button className='mt-2 w-full rounded-lg border border-purple-mid/60 bg-purple-brand/20 px-5 py-2.5 text-xs uppercase tracking-ui text-purple-pale transition-all hover:border-purple-str hover:bg-purple-brand/35 hover:shadow-btn-purple disabled:cursor-not-allowed disabled:opacity-60' type='submit' disabled={loading}>
					{loading ? 'Logging in...' : 'Log in'}
				</button>
			</form>
			<p className='mt-5 mb-0 text-center text-xs uppercase tracking-ui text-white/70'>
				Don&apos;t have an account? <Link to="/register" className='text-purple-pale transition-colors hover:text-purple-light'>Sign up</Link>
			</p>
		</div>
	);
}

export default LoginView;
