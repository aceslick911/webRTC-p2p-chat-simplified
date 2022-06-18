// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {};
  internalEvents: {
    'xstate.init': { type: 'xstate.init' };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {};
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates:
    | 'idle'
    | 'connecting'
    | 'connecting.host'
    | 'connecting.slave'
    | 'connected'
    | 'failedToConnect'
    | { connecting?: 'host' | 'slave' };
  tags: never;
}
