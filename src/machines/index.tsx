import React, { createContext, FC, useEffect, useMemo } from 'react';
import { inspect } from '@xstate/inspect';
import { useMachine } from '@xstate/react';
import { ConnectionMachine } from './connection';
import { AppMachine } from './app';
import { assign, createMachine, send } from 'xstate';

inspect({ iframe: false, url: 'https://stately.ai/viz?inspect=true' });

const RootMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QCcD2qAuA6WGCGyGAxAKoAKAIgIIAqAooqAA6qwCWGbqAdoyAB6IALAFYAjFgBMANjEAGaQHYxSyULEiRAGhABPRAE4Jc+QA5TI9dOvXFAXwc7uqCHD5pMOfISxUmTLG4wAHcAAlw8DDBQsT4Wdk4ePkEEeTEdfQQAZgNFLAMs02lLNUkRA3MsxxAPbAifPyY41g4uXiQBREVFDMRJRSz86SFhrKyhIX6RSWrarwJsAGEeIIBjRO5AkPD8KJjmhLbkxE1pKRNTOQMCuRGsyV6EISv88bkLLLEDEXMRWfQ6t4liswOsjh14q0kh0UiJ7ucxJdrllbtJ7o8ZBIDNIDJIsooLLj+kV-p56hgDlD2qBYVlHojTPkCfchJdTKIDEJSRSIS0NscEJIDPTGXJJHIJXi0eJTOKZg47EA */
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
              initial: 'loading',
              states: {
                loading: {
                  on: {
                    CREATE_CHAT: {
                      target: 'HOST',
                    },
                    JOIN_CHAT: {
                      target: 'SLAVE',
                    },
                  },
                },
                HOST: {},
                SLAVE: {},
              },
            },
            Connection: {
              invoke: {
                src: 'ConnectionMachine',
                id: 'ConnectionMachine',
                autoForward: true,
              },
              initial: 'idle',
              states: {
                idle: {
                  on: {
                    CONNECT: {
                      target: 'connecting',
                    },
                  },
                },
                connecting: {
                  on: {
                    CONNECT_SUCCESS: {
                      target: 'connected',
                    },
                    CONNECTION_FAILED: {
                      target: 'failedToConnect',
                    },
                  },
                },
                connected: {},
                failedToConnect: {},
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

  const appState = state.value['start']?.['App'];
  const conState = state.value['start']?.['Connection'];

  console.log('UPDATED', { state, appState, conState });

  const Data = useMemo(
    () => ({
      AppData: {
        state: appState,
        send: _send,
      },
      ConnectionData: {
        state: conState,
        send: _send,
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
    const appSub = Data.service.subscribe((newState: any) => {
      console.log('STATE', { state: newState.value, newState });
    });

    Data.service.onEvent((ev) => {
      console.log('EV', { ev });
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
        mode: AppData.state,
        startAsHost: () => AppData.send('CREATE_CHAT'),
        startAsSlave: () => AppData.send('JOIN_CHAT'),

        isConnected: ConnectionData.state === 'connected',
        onConnecting: () => ConnectionData.send('CONNECT'),
        onChannelOpen: () => ConnectionData.send('CONNECT_SUCCESS'),
        connectionFailed: () => ConnectionData.send('CONNECTION_FAILED'),
      } as AppContextValue),
    [AppData, ConnectionData, AppData.send, ConnectionData.send, AppData.state, ConnectionData.state],
  );
  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};
