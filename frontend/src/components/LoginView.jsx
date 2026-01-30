import { Link } from 'react-router-dom'
import './LoginView.css'

function LoginView() {
	return (
		<div className='loginView'>
			<h2 className='title'>Log in</h2>
			<div className='inputs'>
				<label>Username:</label>
				<input type="text" className='inputField'/>
				<label>Password:</label>
				<input type="password" className='passInput'/>
			</div>
			<button className='comBut'>Log in</button>
		</div>
	);
}

export default LoginView
