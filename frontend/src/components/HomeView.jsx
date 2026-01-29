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
          <button className='But'>Join game</button>
          <button className='But'>Test Game</button>
        </div>
    </div>
  );
}

export default HomeView
