// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    createRTCPeerConnection: 'setupChannelAsAHost';
  };
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
    | 'connecting.host.offerCreated'
    | 'connecting.host.waitingForChannel'
    | 'connecting.slave'
    | 'connecting.slave.answerReady'
    | 'connecting.slave.waitingForChannel'
    | 'connected'
    | 'connected.chatting'
    | 'connected.sendingFile'
    | 'connected.receivingFile'
    | 'failedToConnect'
    | {
        connecting?:
          | 'host'
          | 'slave'
          | { host?: 'offerCreated' | 'waitingForChannel'; slave?: 'answerReady' | 'waitingForChannel' };
        connected?: 'chatting' | 'sendingFile' | 'receivingFile';
      };
  tags: never;
}
