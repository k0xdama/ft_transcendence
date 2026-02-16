import { Link } from 'react-router-dom'
import './TestView.css'

function TestView () {
	return (
		<div className='testUI'>
			<div className='players-section'>
				PLAYERS
			</div>

			<div className='chat-section'>
				CHAT
			</div>

			<div className='cycles-section'>
				CURRENT CYCLE
			</div>

			<div className='game-section'>
				LOG
			</div>

			<div className='roles-section'>
				ROLES
			</div>
		</div>
	)
}

export default TestView
