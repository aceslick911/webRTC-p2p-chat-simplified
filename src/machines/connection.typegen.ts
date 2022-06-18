// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    createRTCPeerConnection: 'setupChannelAsAHost';
    setPeerConnection: 'SET_PEER_CONNECTION';
    createRTCChannel: '';
  };
  internalEvents: {
    '': { type: '' };
    'xstate.init': { type: 'xstate.init' };
    'done.invoke.host-rtc-connection': {
      type: 'done.invoke.host-rtc-connection';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'error.platform.host-rtc-connection': { type: 'error.platform.host-rtc-connection'; data: unknown };
  };
  invokeSrcNameMap: {
    createRTCPeerConnection: 'done.invoke.host-rtc-connection';
    sendFile: 'done.invoke.ConnectionMachine.connecting.webRTC.peerConnection.services.fileTransfer.sendingFile:invocation[0]';
  };
  missingImplementations: {
    actions: 'createRTCPeerConnection' | 'createRTCChannel';
    services: 'sendFile';
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    createRTCPeerConnection: 'setupChannelAsAHost';
    sendFile: 'START_TRANSFER';
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates:
    | 'idle'
    | 'connecting'
    | 'connecting.webRTC'
    | 'connecting.webRTC.peerConnection'
    | 'connecting.webRTC.peerConnection.initializing'
    | 'connecting.webRTC.peerConnection.offerCreated'
    | 'connecting.webRTC.peerConnection.waitingForChannel'
    | 'connecting.webRTC.peerConnection.services'
    | 'connecting.webRTC.peerConnection.services.fileTransfer'
    | 'connecting.webRTC.peerConnection.services.fileTransfer.sentInfo'
    | 'connecting.webRTC.peerConnection.services.fileTransfer.sendingFile'
    | 'connecting.webRTC.peerConnection.services.channel'
    | 'connecting.webRTC.peerConnection.services.channel.created'
    | 'connecting.webRTC.peerConnection.services.channel.open'
    | 'connecting.webRTC.peerConnection.services.offer'
    | 'connecting.webRTC.peerConnection.services.offer.answered'
    | 'connecting.webRTC.peerConnection.services.offer.created'
    | 'connecting.webRTC.peerConnection.services.flows'
    | 'connecting.webRTC.peerConnection.services.flows.Host'
    | 'connecting.webRTC.peerConnection.services.flows.Client'
    | 'connecting.webRTC.peerConnection.services.flows.pick'
    | 'connecting.webRTC.peerConnection.services.flows.waitingForAnswer'
    | 'connecting.webRTC.peerConnection.services.flows.offerAnswered'
    | 'connecting.webRTC.peerConnection.services.flows.createdAnswer'
    | 'connecting.webRTC.peerConnection.services.flows.new state 1'
    | 'connecting.slave'
    | 'connecting.slave.answerReady'
    | 'connecting.slave.waitingForChannel'
    | 'connected'
    | 'connected.chatting'
    | 'connected.sendingFile'
    | 'connected.receivingFile'
    | 'terminated'
    | 'failedToConnect'
    | {
        connecting?:
          | 'webRTC'
          | 'slave'
          | {
              webRTC?:
                | 'peerConnection'
                | {
                    peerConnection?:
                      | 'initializing'
                      | 'offerCreated'
                      | 'waitingForChannel'
                      | 'services'
                      | {
                          services?:
                            | 'fileTransfer'
                            | 'channel'
                            | 'offer'
                            | 'flows'
                            | {
                                fileTransfer?: 'sentInfo' | 'sendingFile';
                                channel?: 'created' | 'open';
                                offer?: 'answered' | 'created';
                                flows?:
                                  | 'Host'
                                  | 'Client'
                                  | 'pick'
                                  | 'waitingForAnswer'
                                  | 'offerAnswered'
                                  | 'createdAnswer'
                                  | 'new state 1';
                              };
                        };
                  };
              slave?: 'answerReady' | 'waitingForChannel';
            };
        connected?: 'chatting' | 'sendingFile' | 'receivingFile';
      };
  tags: never;
}
