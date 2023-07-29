import { useAuth0 } from '@auth0/auth0-react';
import './HomeStyles.css';
import { useNavigate } from 'react-router-dom';

function Home() {
  const { loginWithRedirect, logout } = useAuth0();

  return (
    <div className="Home">
      <div className="Home-banner" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/banner.png)` }} />
      <header className="Home-header">
        <div className="Home-header-left-pane">
          <div className="Home-banner-text">
            <h1>Welcome to Theologian.chat!</h1>
            <p>
              Dive into the wisdom of the past. Chat with an AI trained to answer like some of the greatest minds in the
              Christian Tradition. <b>FOR FREE. (THIS IS IN BETA)</b>
            </p>
            <div className="Home-button-holder">
              <button
                className="Home-button"
                onClick={() =>
                  loginWithRedirect({
                    authorizationParams: {
                      screen_hint: 'signup',
                    },
                  })
                }
              >
                Start Chatting Today!
              </button>
              <button className="Home-button-2" onClick={() => logout()}>
                Test Logout
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Home;
