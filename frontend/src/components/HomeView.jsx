import { Link } from 'react-router-dom'

function HomeView() {
  return (
    <div className='homeView'>
      <h1>Garou Loup</h1>
      <p>"🚉 au loup"</p>
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
