import { Link } from 'react-router-dom'

function CreateGameView() {
	return (
		<div className='createGameView'>
			<Link to="/">
				<button className='backBut'>← Back</button>
			</Link>
			<div className='createBox'>
				<h2>Create New Game</h2>
			</div>
		</div>
	)
}

export default CreateGameView
