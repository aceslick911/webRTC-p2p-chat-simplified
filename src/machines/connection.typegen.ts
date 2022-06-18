// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    setPeerConnection: 'SET_PEER_CONNECTION';
  };
  internalEvents: {
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
    actions: never;
    services: 'sendFile';
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    createRTCPeerConnection: 'xstate.init';
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
    | 'connecting.webRTC.peerConnection.services.flows.pick'
    | 'connecting.webRTC.peerConnection.services.flows.Host'
    | 'connecting.webRTC.peerConnection.services.flows.Host.creatingOffer'
    | 'connecting.webRTC.peerConnection.services.flows.Host.waitingForAnswer'
    | 'connecting.webRTC.peerConnection.services.flows.Host.offerAnswered'
    | 'connecting.webRTC.peerConnection.services.flows.Client'
    | 'connecting.webRTC.peerConnection.services.flows.Client.waitingForOffer'
    | 'connecting.webRTC.peerConnection.services.flows.Client.createdAnswer'
    | 'connecting.webRTC.peerConnection.services.flows.Client.waitingForChannel'
    | 'connecting.webRTC.peerConnection.services.flows.chatting'
    | 'connecting.webRTC.peerConnection.services.flows.finishedChatting'
    | 'connecting.webRTC.slave'
    | 'connecting.webRTC.slave.answerReady'
    | 'connecting.webRTC.slave.waitingForChannel'
    | 'connecting.on'
    | 'connected'
    | 'connected.chatting'
    | 'connected.sendingFile'
    | 'connected.receivingFile'
    | 'terminated'
    | 'failedToConnect'
    | {
        connecting?:
          | 'webRTC'
          | 'on'
          | {
              webRTC?:
                | 'peerConnection'
                | 'slave'
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
                                  | 'pick'
                                  | 'Host'
                                  | 'Client'
                                  | 'chatting'
                                  | 'finishedChatting'
                                  | {
                                      Host?: 'creatingOffer' | 'waitingForAnswer' | 'offerAnswered';
                                      Client?: 'waitingForOffer' | 'createdAnswer' | 'waitingForChannel';
                                    };
                              };
                        };
                    slave?: 'answerReady' | 'waitingForChannel';
                  };
            };
        connected?: 'chatting' | 'sendingFile' | 'receivingFile';
      };
  tags: never;
}
