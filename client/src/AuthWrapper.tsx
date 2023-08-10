import { useNavigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';

interface Auth0ProviderWithHistoryProps {
  children: any;
}

const Auth0ProviderWithHistory = ({ children }: Auth0ProviderWithHistoryProps) => {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN as string;
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID as string;
  const audience = 'theologian.chat';

  const navigate = useNavigate();

  const onRedirectCallback = (appState: any) => {
    navigate('/chats');
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin + '/chats',
        audience,
        cache_location: 'localstorage',
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;
