import React, { useEffect } from 'react';
import App from './src/App';
import { pingApi, setApiBaseUrl } from './services/ReportService';

const Root = () => {
  useEffect(() => {
    // Replace with your PC LAN IP or a reachable tunnel (ngrok / expo tunnel)
    setApiBaseUrl('http://192.168.1.42:3000/v1');

    (async () => {
      const r = await pingApi();
      console.log('pingApi result:', r);
    })();
  }, []);

  return <App />;
};

export default Root;

