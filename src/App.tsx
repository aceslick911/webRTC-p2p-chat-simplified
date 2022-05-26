import React, { memo, FC } from 'react';
import styled from 'styled-components';

import { Chat } from './components/Chat/Chat';
import { HostOrSlave } from './components/HostOrSlave';
import { Host } from './components/Host';
import { Slave } from './components/Slave';
import { AppHeader } from './components/AppHeader';
import { AppFooter } from './components/AppFooter';
import { useChat, useChatPeerConnectionSubscription } from './module/useChat/useChat';

import pkg from '../package.json';
import { useApp } from './machines';

const InnerWrapper = styled.div`
  background-color: white;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
`;
const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: 12px;
  margin: auto auto;
  flex: 1 0 0;
`;

const App: FC = memo(function App() {
  const { mode, isConnected } = useChat();

  useChatPeerConnectionSubscription();

  return (
    <Wrapper>
      <InnerWrapper>
        <AppHeader />
        {(!mode || mode === 'loading') && <HostOrSlave />}
        {mode === 'HOST' && !isConnected && <Host />}
        {mode === 'SLAVE' && !isConnected && <Slave />}
        {mode && isConnected && <Chat />}
        <AppFooter version={`v${pkg.version}`} homepage="github.com/aceslick911/webRTC-p2p-chat-simplified" />
      </InnerWrapper>
    </Wrapper>
  );
});

export default App;
