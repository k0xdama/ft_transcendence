import { Link } from 'react-router-dom'
import './CreateGameView.css'

function CreateGameView() {
	return (
		<div className='createGameView'>
			<div className='createBox'>
				<h2 className='boxTitle'>Create New Game</h2>
				<div className='createInputs'>
					<label className>Players</label>
					<input type='number' min={3} max={7} defaultValue={3} className='maxPlayers'></input>
				</div>
				<button>Create</button>
			</div>
		</div>
	)
}

export default CreateGameView
