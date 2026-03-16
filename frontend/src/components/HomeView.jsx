import { Link } from 'react-router-dom'
import './HomeView.css'

function HomeView() {
  return (
    <div className='homeView'>
      <h1>Trois Cartes</h1>
      <p>"🃏 par trois"</p>
        <div className='buttonContainer'>
          <Link to="/create">
            <button className='createBut'>Create game</button>
          </Link>
          <Link to="/join">
            <button className='But'>Join game</button>
          </Link>
          <Link to="/test">
            <button className='But'>Test Game</button>
          </Link>
        </div>
    </div>
  );
}

export default HomeView
