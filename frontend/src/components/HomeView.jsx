import { Link } from 'react-router-dom'
import './HomeView.css'

function HomeView() {
  return (
    <div className='homeView'>
      <h1>Triple</h1>
      {/* <p>"A card, deduction, and memory game for 3 to 6 players with two game modes: “Simple” or “Spicy”"</p> */}
        <div className='buttonContainer'>
          <Link to="/create">
            <button className='createBut'>Create game</button>
          </Link>
          <Link to="/join">
            <button className='But'>Join game</button>
          </Link>
          <Link to="/matchmaking">
            <button className='But'>Public Match</button>
          </Link>
        </div>
    </div>
  );
}

export default HomeView
