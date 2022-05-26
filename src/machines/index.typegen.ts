// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    notify: 'UPDATE';
  };
  internalEvents: {
    'xstate.init': { type: 'xstate.init' };
    'done.invoke.AppMachine': {
      type: 'done.invoke.AppMachine';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'error.platform.AppMachine': { type: 'error.platform.AppMachine'; data: unknown };
    'done.invoke.ConnectionMachine': {
      type: 'done.invoke.ConnectionMachine';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'error.platform.ConnectionMachine': { type: 'error.platform.ConnectionMachine'; data: unknown };
  };
  invokeSrcNameMap: {
    AppMachine: 'done.invoke.AppMachine';
    ConnectionMachine: 'done.invoke.ConnectionMachine';
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    AppMachine: 'xstate.init';
    ConnectionMachine: 'xstate.init';
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates:
    | 'start'
    | 'start.App'
    | 'start.App.loading'
    | 'start.App.home'
    | 'start.App.host'
    | 'start.App.host.waitingForClient'
    | 'start.App.host.connected'
    | 'start.App.client'
    | 'start.App.client.waitingForHost'
    | 'start.App.client.connected'
    | 'start.Connection'
    | 'start.Connection.idle'
    | 'start.Connection.connecting'
    | 'start.Connection.connected'
    | 'start.Connection.failedToConnect'
    | {
        start?:
          | 'App'
          | 'Connection'
          | {
              App?:
                | 'loading'
                | 'home'
                | 'host'
                | 'client'
                | { host?: 'waitingForClient' | 'connected'; client?: 'waitingForHost' | 'connected' };
              Connection?: 'idle' | 'connecting' | 'connected' | 'failedToConnect';
            };
      };
  tags: never;
}
