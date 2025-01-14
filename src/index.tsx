import React from 'react';
import ReactDOM from 'react-dom';

import * as serviceWorker from './serviceWorker';
import { PeerConnectionProvider } from './module/PeerConnection/PeerConnection';
import { FileBuffersProvider } from './module/FileBuffers/FileBuffers';
import { GlobalStyle } from './styles/globalStyle';
import App from './App';
import { AppProvider } from './machines';

ReactDOM.render(
  <AppProvider>
    <PeerConnectionProvider>
      <FileBuffersProvider>
        <>
          <GlobalStyle />
          <App />
        </>
      </FileBuffersProvider>
    </PeerConnectionProvider>
  </AppProvider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
