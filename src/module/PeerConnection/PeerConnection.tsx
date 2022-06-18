import React, { createContext, FC, useState, useRef, useCallback, useEffect, useContext, useMemo } from 'react';
import { Subject } from 'rxjs';
import { AppContext } from '../../machines';

import { createPeerConnection, CreatePeerConnectionResponse } from './createPeerConnection';

export type ConnectionDescription = {
  description: string;
};
// export enum PEER_CONNECTION_MODE {
//   HOST = 'HOST',
//   SLAVE = 'SLAVE',
// }

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
  mode: any; // PEER_CONNECTION_MODE | undefined;
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
  const app = useContext(AppContext);

  // console.log('APP CONTE', { app });

  const [localDescription, setLocalDescription] = useState<string | undefined>();

  //const [isConnected, setIsConnected] = useState(false);

  const peerConnectionRef = useRef<CreatePeerConnectionResponse>();

  const { onConnecting, onChannelOpen, dispatch, onConnectionEvent, connectionState } = app;

  const onMessageReceived = useCallback((messageString: string) => {
    try {
      const message = JSON.parse(messageString);
      peerConnectionSubject.next(message);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const startAsHost = useCallback(async () => {
    // console.group('startAsHostCB');
    app.startAsHost();
    onConnecting();
    console.log('HOST - 1 - createPeerConnection');
    peerConnectionRef.current = await createPeerConnection({
      iceServers,
      onMessageReceived,
      onChannelOpen,

      dispatch,
      onConnectionEvent,
      connectionState,
    });

    console.log('HOST - 2 - setLocalDescription', { peerConnectionRef });
    // console.log({ localDescription: peerConnectionRef.current.localDescription });
    setLocalDescription(Base64.encode(peerConnectionRef.current.localDescription));
    // console.groupEnd();
  }, [app.mode, app.startAsHost, onMessageReceived, onChannelOpen, setLocalDescription]);

  const startAsSlave = useCallback(
    async (connectionDescription: ConnectionDescription) => {
      app.startAsSlave();
      onConnecting();

      console.log('SLAVE - 1 - createPeerConnection');
      peerConnectionRef.current = await createPeerConnection({
        iceServers,
        remoteDescription: Base64.decode(connectionDescription.description),
        onMessageReceived,
        onChannelOpen,

        dispatch,
        onConnectionEvent,
        connectionState,
      });
      // console.log({ localDescription: peerConnectionRef.current.localDescription });
      console.log('SLAVE - 2 - setLocalDescription', { peerConnectionRef });
      setLocalDescription(Base64.encode(peerConnectionRef.current.localDescription));
    },
    [app.mode, app.startAsSlave, onMessageReceived, onChannelOpen, setLocalDescription],
  );

  const setRemoteConnectionDescription = useCallback((connectionDescription: ConnectionDescription) => {
    if (!peerConnectionRef.current) return;

    console.log('?? - 3 - setAnswerDescription', { connectionDescription });
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
        mode: app.mode,
        isConnected: app.isConnected,
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
