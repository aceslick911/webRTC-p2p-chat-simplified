import React, { createContext, FC, useState, useRef, useCallback, useEffect, useContext, useMemo } from 'react';
import { Subject } from 'rxjs';

import { createPeerConnection, CreatePeerConnectionResponse } from './createPeerConnection';

export type ConnectionDescription = {
  description: string;
};
export enum PEER_CONNECTION_MODE {
  HOST = 'HOST',
  SLAVE = 'SLAVE',
}

const iceServers: RTCIceServer[] = [
  {
    urls: 'stun:stun.l.google.com:19302',
  },
  // {
  //   urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
  //   username: 'webrtc',
  //   credential: 'webrtc',
  // },
];

const peerConnectionSubject = new Subject<any>();

interface PeerConnectionContextValue {
  mode: PEER_CONNECTION_MODE | undefined;
  isConnected: boolean;
  localConnectionDescription: ConnectionDescription | undefined;
  startAsHost: () => void;
  startAsSlave: (connectionDescription: ConnectionDescription) => void;
  setRemoteConnectionDescription: (connectionDescription: ConnectionDescription) => void;
  sendMessage: (message: any) => void;
  peerConnectionSubject: typeof peerConnectionSubject;
}

const PeerConnectionContext = createContext<PeerConnectionContextValue>({} as PeerConnectionContextValue);

export const PeerConnectionProvider: FC = ({ children }) => {
  const [mode, setMode] = useState<PEER_CONNECTION_MODE | undefined>(undefined);

  const [localDescription, setLocalDescription] = useState<string | undefined>();
  const [isConnected, setIsConnected] = useState(false);
  const peerConnectionRef = useRef<CreatePeerConnectionResponse>();

  const onChannelOpen = useCallback(() => setIsConnected(true), [setIsConnected]);

  const onMessageReceived = useCallback((messageString: string) => {
    try {
      const message = JSON.parse(messageString);
      peerConnectionSubject.next(message);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const startAsHost = useCallback(async () => {
    if (typeof mode !== 'undefined') return;

    setMode(PEER_CONNECTION_MODE.HOST);
    peerConnectionRef.current = await createPeerConnection({
      iceServers,
      onMessageReceived,
      onChannelOpen,
    });

    setLocalDescription(Base64.encode(peerConnectionRef.current.localDescription));
  }, [mode, setMode, onMessageReceived, onChannelOpen, setLocalDescription]);

  const startAsSlave = useCallback(
    async (connectionDescription: ConnectionDescription) => {
      if (typeof mode !== 'undefined') return;

      setMode(PEER_CONNECTION_MODE.SLAVE);

      peerConnectionRef.current = await createPeerConnection({
        iceServers,
        remoteDescription: Base64.decode(connectionDescription.description),
        onMessageReceived,
        onChannelOpen,
      });
      console.log('peerConnectionRef.current.localDescription', peerConnectionRef.current.localDescription);
      setLocalDescription(Base64.encode(peerConnectionRef.current.localDescription));
    },
    [mode, setMode, onMessageReceived, onChannelOpen, setLocalDescription],
  );

  const setRemoteConnectionDescription = useCallback((connectionDescription: ConnectionDescription) => {
    if (!peerConnectionRef.current) return;

    peerConnectionRef.current.setAnswerDescription(Base64.decode(connectionDescription.description));
  }, []);

  const sendMessage = useCallback((message) => {
    if (!peerConnectionRef.current) return;

    const messageString = JSON.stringify(message);

    peerConnectionRef.current.sendMessage(messageString);
  }, []);

  const localConnectionDescription: ConnectionDescription | undefined = useMemo(
    () =>
      localDescription
        ? {
            description: localDescription,
          }
        : undefined,
    [localDescription],
  );

  return (
    <PeerConnectionContext.Provider
      value={{
        mode,
        isConnected,
        localConnectionDescription,
        startAsHost,
        startAsSlave,
        setRemoteConnectionDescription,
        sendMessage,
        peerConnectionSubject,
      }}
    >
      {children}
    </PeerConnectionContext.Provider>
  );
};

export const usePeerConnection = <T extends any>() => {
  const {
    mode,
    isConnected,
    localConnectionDescription,
    startAsHost,
    startAsSlave,
    setRemoteConnectionDescription,
    sendMessage,
  } = useContext(PeerConnectionContext);

  return {
    mode,
    isConnected,
    localConnectionDescription,
    startAsHost,
    startAsSlave,
    setRemoteConnectionDescription,
    sendMessage: sendMessage as (message: T) => void,
  };
};

export const usePeerConnectionSubscription = <T extends any>(onMessageReceived: (message: T) => void) => {
  const { peerConnectionSubject } = useContext(PeerConnectionContext);

  useEffect(() => {
    const subscription = (peerConnectionSubject as Subject<T>).subscribe(onMessageReceived);

    return () => subscription.unsubscribe();
  }, [peerConnectionSubject, onMessageReceived]);
};
