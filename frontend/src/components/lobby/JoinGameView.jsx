import { Link } from 'react-router-dom'
import './JoinGameView.css'

function JoinGameView() {
	return (
		<div className='joinGameView'>
			<div className='joinBox'>
				<h2 className='boxTitle'>Join Game</h2>
				<div className='joinInputs'>
					<label className>Game ID</label>
					<input type='text' className='gameID'></input>
				</div>
				<button>Join</button>
			</div>
		</div>
	)
}

export default JoinGameView
