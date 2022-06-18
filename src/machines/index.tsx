import React, { createContext, FC, useEffect, useMemo } from 'react';
import { inspect } from '@xstate/inspect';
import { useMachine } from '@xstate/react';
import { ConnectionMachine } from './connection';
import { AppMachine } from './app';
import { assign, createMachine, send, State } from 'xstate';

inspect({ iframe: false, url: 'https://stately.ai/viz?inspect=true' });

const RootMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QCcD2qAuA6WGCGy2AggA4lYA2qeEAlgHZQDEAHrnhmFngGafIAKAIwAGMQEomaTDnyEspclRoMoiUCVSxaGWqnrqQLRACYALAHYsANhEBOAMwXrZgByvr1kw4CsAGhAAT0QzEWssIQ9rIU9zC3sTHwBfJIDpbHZ5RSwAC1QAWzAmAGEAJQBRIgAVcoB9YoAJasNNbV19Q2MEHxNXLDMTSLszaztotwDghAc7PpEhOzsFux8fC3jPFLT0DLliMlyCooApAHkASQA5eqaqlq0dPQMkI0QevoGhkbGhCaCQ6xWeaLHzWVy9CxLOxbEDpWQEfbkPK4LAAdzwj0YADFUMhihRaGB6BgSgAZc7lS5VeqnAAi5XubSenUQSysrgsAxMjncgxEJkmiF8ZiwFlW1h8MUWFgcQk5MLhmURWAAxgSidh0ZioDjkA0tCSGqcAMrU4p0hkvVqPDovLp2ERWUQONy2dbLayC7oxLCSxYOFxmcVLBU7eHyYr6ehgFXtehYWgQChFc2XS7lYp3K0POMshAmRJYRbFwGOCUiBwOL0WXoRKLvUQS0GhmRKrCR+jR2NPVVRmO6RglU5pjPU40AVWKxXKxuNjJtz1AXR6JhsFkiLlcIlcDnc-n+CBrIiwwNmllGO5DqVhYbbHa7cd7nf7qiHI8z52HtSxRHOpPKtLzrmdpvAWa4bm4267q4+5TBYrh2Ceyy+GKrhmMMQgtrsCJMOOAAKtLVJaGg5syIEICMVjDD4DjzGY6E+PRrheksSHFjMtE7lurgpNe9CoBAcCGIqewKAcyh0IwQFkUuiCiBYXqhMeG62EIPj2GE25YeGyp5IU0m2rJ0yLP0gwIfRgJCN4iliHWnjzOpDq2Gh2lttkyKahiA46ri+KEsSBmLq8h5gWsFa7k4swFmYXoun0iSghKgwFiIjGuaJ7kGk+D6QIFeaiGsRaDD4riRKEHJVgecVYAl5YIaV9EOOlCJiUiBp5eRF6+vElY7pC4LmF6JhijV4oDBKDjmJK1jNVkBxqv5nnarq+q4B1RnxB8ZlLBWcpuDFB6Ssep7oSsW7jbNyoLRq2X9rl2ZMoZwUFVYoLRTEPSeMMXpHWxwwgudJgzdeIktdk10BQ9C55mCIqfAhzp7WhilOH9ZhykIspmC6l2tetwU7l6alCKNoIBnYw1eI6Zi4-eL76AmSZgPjXTydWYEqU4ozqY6mEg7eol092DMqn23ZSVDwFGcK3WlbK3KlR4zEHjWq6c84KxiOutNi4+ovPrG90kY9QVdDKq62GWMT8hW7jVr8f2jBK6NOTrBuPjwGLJhAVSoELGAs4g5s2PYAbWyYtvK3BO5-esCEOvVbsPjJIDWlLBOVVMiVowDIgXfzrZ7IH3R2NW8VjdyYzwUDTUFwHksp10vg-aTLgLNuSwzMMvFJEAA */
  createMachine(
    {
      context: { counter: 0 },
      tsTypes: {} as import('./index.typegen').Typegen0,
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
              },
              initial: 'loading',
              states: {
                loading: {
                  after: {
                    '1000': {
                      target: 'home',
                    },
                  },
                },
                home: {
                  on: {
                    CREATE_CHAT: {
                      target: 'host',
                    },
                    JOIN_CHAT: {
                      target: 'client',
                    },
                  },
                },
                host: {
                  initial: 'waitingForClient',
                  states: {
                    waitingForClient: {
                      on: {
                        CLIENT_CODE: {
                          target: 'connected',
                        },
                      },
                    },
                    connected: {},
                  },
                },
                client: {
                  initial: 'waitingForHost',
                  states: {
                    waitingForHost: {
                      on: {
                        HOST_CODE: {
                          target: 'connected',
                        },
                      },
                    },
                    connected: {},
                  },
                },
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
            // console.log('EV NOTIF', e);
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
    // if (fw) console.log((fw && 'appEv' + fw) || 'appEV', { type: ev.type, ev });
  }
};

export const useApp = () => {
  const machineOptions = { devTools: true };

  const [state, _send, service] = useMachine(RootMachine, machineOptions);

  const appState = state.value['start']?.['App'];
  const conState = state.value['start']?.['Connection'];

  // console.log('UPDATED', { state, appState, conState });

  const Data = useMemo(
    () => ({
      AppData: {
        state: appState,
        send: (...args) => {
          console.log('SEND', ...args);
          _send.call(undefined, args);
        },
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
      // console.log('STATE', { state: newState.value, newState });
    });

    Data.service.onEvent((ev) => {
      // console.log('EV', { ev });
      // eventLogger(ev, undefined);
    });

    return () => {
      appSub.unsubscribe();
    };
  }, [Data]);

  return Data;
};

interface AppContextValue {
  mode: any;
  startAsHost: () => void;
  startAsSlave: () => void;

  isConnected: boolean;
  onChannelOpen: () => void;
  connectionFailed: () => void;
  onConnecting: () => void;

  dispatch: (event: any) => void;
  onConnectionEvent: (handler: (event: any) => void | any) => void;

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

        dispatch: (event: any) => ConnectionData.send(event),
        onConnectionEvent: (handler) => {
          console.log('REGISTERED HANDLER', handler);
        },
      } as AppContextValue),
    [AppData, ConnectionData, AppData.send, ConnectionData.send, AppData.state, ConnectionData.state],
  );
  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};
