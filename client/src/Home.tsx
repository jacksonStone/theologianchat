import './HomeStyles.css';
import { useState } from 'react';
const handleAuth = async (email: string, password: string, route: string) => {
  try {
    const response = await fetch(route, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (response.status === 200) {
      window.location.href = '/chats';
    } else {
      const errorData = await response.json();
      console.error('Error creating user:', errorData);
    }
  } catch (error) {
    console.error('There was an error sending the request:', error);
  }
};
const handleSignup = (email: string, password: string) => {
  handleAuth(email, password, '/api/user/create');
};
const handleLogin = (email: string, password: string) => {
  handleAuth(email, password, '/api/user/login');
};
function Home() {
  // State to hold the user's email and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="Home">
      <div className="Home-banner" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/banner.png)` }} />
      <header className="Home-header">
        <div className="Home-header-left-pane">
          <div className="Home-banner-text">
            <h1>Welcome to Theologian.chat!</h1>
            <p>
              Dive into the wisdom of the past. Chat with an AI designed to answer like some of the greatest minds in
              the Christian Tradition. <b>FOR FREE. (THIS IS IN BETA)</b>
            </p>
            <div className="Home-input-holder">
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="Home-input"
              />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="Home-input"
              />
            </div>
            <div className="Home-button-holder">
              <button
                className="Home-button"
                onClick={() => {
                  // Integrate login logic here
                  handleSignup(email, password);
                }}
              >
                Signup
              </button>
              <button
                className="Home-button"
                onClick={() => {
                  // Integrate login logic here
                  handleLogin(email, password);
                }}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default Home;
