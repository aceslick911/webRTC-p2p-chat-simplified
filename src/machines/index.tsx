import React, { createContext, FC, useEffect, useMemo } from 'react';
import { inspect } from '@xstate/inspect';
import { useMachine } from '@xstate/react';
import { ConnectionMachine } from './connection';
import { AppMachine } from './app';
import { assign, createMachine, send } from 'xstate';

inspect({ iframe: false, url: 'https://stately.ai/viz?inspect=true' });

const RootMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QCcD2qAuA6WGCGy2AggA4kDEAwgPIBytAopQCqKgmqwCWGXqAdmxAAPRABYADAGYsANjEB2AIxKAHEolKFAJlWqANCACeiKRICsWMbM1Ld2sUqnmFAX1eG0mHPkLkAqgAKACJEzAxCHNy8AkKiCGLmSljashqyyhkOSubmhiYIAJzJmhJ65o6yVVVu7ob8qBBwQl7YuATEZJGcPHyCSCKICgr5iNoKMoXyWbqasoUudSCtPh1YlAL8YADGMf3sPXtxiOZS2imaqhKFhWbWZ6MIqclThdoSCm-qslKqSyvtQjdaJ9Y4IU6PNSqLCFBSqM7aJJKMSw5H-dAYYG9WIDeLaQqQ6GaG7whRZRIZWruIA */
  createMachine(
    {
      context: { counter: 0 },
      id: 'root',
      initial: 'start',
      states: {
        start: {
          type: 'parallel',
          states: {
            App: {
              invoke: {
                src: 'AppMachine',
                id: 'AppMachine',
                autoForward: true,
              },
              on: {
                CONNECT: {
                  target: 'Connection',
                },
              },
            },
            Connection: {
              invoke: {
                src: 'ConnectionMachine',
                id: 'ConnectionMachine',
                autoForward: true,
              },
            },
          },
          on: {
            UPDATE: {
              actions: 'notify',
            },
          },
        },
      },
    },
    {
      actions: {
        notify: assign({
          counter: (c, e) => {
            console.log('EV NOTIF', e);
            return c.counter + 1;
          },
        }),
      },

      services: {
        AppMachine,
        ConnectionMachine,
      },
    },
  );

const eventLogger = (ev, fw) => {
  if (ev.type === 'xstate.send') {
    eventLogger(ev['event'], (fw || '') + ' >' + ev.to);
  } else {
    if (fw) console.log((fw && 'appEv' + fw) || 'appEV', { type: ev.type, ev });
  }
};

export const useApp = () => {
  const machineOptions = { devTools: true };

  const [state, _send, service] = useMachine(RootMachine, machineOptions);

  // useEffect(()=>{
  //   console.log("DETECTED CHILD CHANGED");
  // },[state.children.AppMachine.state,state.children.ConnectionMachine.state])

  console.log('UPDATED', state, state.children.AppMachine.state, state.children.ConnectionMachine.state);

  // const AppData = useMachine(AppMachine, machineOptions);
  // const ConnectionData = useMachine(ConnectionMachine, machineOptions);

  const Data = useMemo(
    () => ({
      AppData: {
        state: state.children['AppMachine']?.['state'],
        send: _send, //(ev) => _send({ type: 'SEND_TO_APP', payload: ev }), //state.children?.['AppMachine']?.['sendTo'], //
      },
      ConnectionData: {
        state: state.children['ConnectionMachine']?.['state'],
        send: _send, //(ev) => _send({ type: 'SEND_TO_CONN', payload: ev }), //state.children?.['ConnectionMachine']?.['sendTo'],
      },

      send: _send,
      service,
    }),
    [
      state.children,
      _send,
      service,
      state.children['AppMachine']?.['state'],
      state.children['ConnectionMachine']?.['state'],
      state.children['AppMachine']?.['state']['value'],
      state.children['ConnectionMachine']?.['state']['value'],
    ],
  );

  useEffect(() => {
    console.log({ Data });
    const appSub = Data.service.subscribe((newState: any) => {
      console.log('appSub', { state: newState.value, newState });
    });

    Data.service.onEvent((ev) => {
      console.log({ ev });
      // eventLogger(ev, undefined);
    });

    return () => {
      appSub.unsubscribe();
    };
  }, [Data]);

  return Data;
};

interface AppContextValue {
  mode: string;
  startAsHost: () => void;
  startAsSlave: () => void;

  isConnected: boolean;
  onChannelOpen: () => void;
  connectionFailed: () => void;
  onConnecting: () => void;

  //mode: any; //PEER_CONNECTION_MODE | undefined;
  // isConnected: boolean;
  // localConnectionDescription: ConnectionDescription | undefined;
  // startAsHost: () => void;
  // startAsSlave: (connectionDescription: ConnectionDescription) => void;
  // setRemoteConnectionDescription: (connectionDescription: ConnectionDescription) => void;
  // sendMessage: (message: any) => void;
  // peerConnectionSubject: typeof peerConnectionSubject;
}

//const AppContext = createContext<AppContextValue>({} as AppContextValue);
export const AppContext = createContext<AppContextValue>(null as AppContextValue);

export const AppProvider: FC = ({ children }) => {
  const { AppData, ConnectionData } = useApp();

  const context = useMemo(
    () =>
      ({
        mode: AppData.state.value,
        startAsHost: () => AppData.send('CREATE_CHAT'),
        startAsSlave: () => AppData.send('JOIN_CHAT'),

        isConnected: ConnectionData.state.value === 'connected',
        onConnecting: () => ConnectionData.send('CONNECT'),
        onChannelOpen: () => ConnectionData.send('CONNECT_SUCCESS'),
        connectionFailed: () => ConnectionData.send('CONNECTION_FAILED'),
      } as AppContextValue),
    [AppData, ConnectionData, AppData.send, ConnectionData.send, AppData.state, ConnectionData.state],
  );
  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};
