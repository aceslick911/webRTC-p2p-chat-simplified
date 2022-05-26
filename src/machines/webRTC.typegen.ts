// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    setPeerConnection: 'SET_PEER_CONNECTION';
    setDataChannel: 'SET_DATA_CHANNEL';
  };
  internalEvents: {
    'xstate.init': { type: 'xstate.init' };
    'done.invoke.rtc': {
      type: 'done.invoke.rtc';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'error.platform.rtc': { type: 'error.platform.rtc'; data: unknown };
  };
  invokeSrcNameMap: {
    rtcPeerConnection: 'done.invoke.rtc';
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    rtcPeerConnection: 'xstate.init';
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates:
    | 'idle'
    | 'connections'
    | 'connections.peerConnection'
    | 'connections.channelInstance'
    | { connections?: 'peerConnection' | 'channelInstance' };
  tags: never;
}
