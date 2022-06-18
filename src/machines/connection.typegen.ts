// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    setPeerConnection: 'START_PEER_CONNECTION';
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
    createDataChannel: 'done.invoke.ConnectionMachine.connecting.webRTC.peerConnection.services.channel:invocation[0]';
    sendFile: 'done.invoke.ConnectionMachine.connecting.webRTC.peerConnection.services.flows.chatting.fileTransfer.sendingFile:invocation[0]';
    receiveFile: 'done.invoke.ConnectionMachine.connecting.webRTC.peerConnection.services.flows.chatting.fileTransfer.receivingFile:invocation[0]';
  };
  missingImplementations: {
    actions: never;
    services: 'createDataChannel' | 'sendFile' | 'receiveFile';
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    createRTCPeerConnection: 'xstate.init';
    createDataChannel: 'xstate.init';
    sendFile: 'START_TRANSFER';
    receiveFile: 'TRANSFER_START';
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates:
    | 'idle'
    | 'connecting'
    | 'connecting.webRTC'
    | 'connecting.webRTC.peerConnection'
    | 'connecting.webRTC.peerConnection.initializing'
    | 'connecting.webRTC.peerConnection.services'
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
    | 'connecting.webRTC.peerConnection.services.flows.Host.waitingForChannel'
    | 'connecting.webRTC.peerConnection.services.flows.Client'
    | 'connecting.webRTC.peerConnection.services.flows.Client.waitingForOffer'
    | 'connecting.webRTC.peerConnection.services.flows.Client.createdAnswer'
    | 'connecting.webRTC.peerConnection.services.flows.Client.waitingForChannel'
    | 'connecting.webRTC.peerConnection.services.flows.chatting'
    | 'connecting.webRTC.peerConnection.services.flows.chatting.fileTransfer'
    | 'connecting.webRTC.peerConnection.services.flows.chatting.fileTransfer.transferRequest'
    | 'connecting.webRTC.peerConnection.services.flows.chatting.fileTransfer.sendingFile'
    | 'connecting.webRTC.peerConnection.services.flows.chatting.fileTransfer.pickFileToSend'
    | 'connecting.webRTC.peerConnection.services.flows.chatting.fileTransfer.noTransfer'
    | 'connecting.webRTC.peerConnection.services.flows.chatting.fileTransfer.waitingToStart'
    | 'connecting.webRTC.peerConnection.services.flows.chatting.fileTransfer.waitingToAccept'
    | 'connecting.webRTC.peerConnection.services.flows.chatting.fileTransfer.receivingFile'
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
                      | 'services'
                      | {
                          services?:
                            | 'channel'
                            | 'offer'
                            | 'flows'
                            | {
                                channel?: 'created' | 'open';
                                offer?: 'answered' | 'created';
                                flows?:
                                  | 'pick'
                                  | 'Host'
                                  | 'Client'
                                  | 'chatting'
                                  | 'finishedChatting'
                                  | {
                                      Host?: 'creatingOffer' | 'waitingForAnswer' | 'waitingForChannel';
                                      Client?: 'waitingForOffer' | 'createdAnswer' | 'waitingForChannel';
                                      chatting?:
                                        | 'fileTransfer'
                                        | {
                                            fileTransfer?:
                                              | 'transferRequest'
                                              | 'sendingFile'
                                              | 'pickFileToSend'
                                              | 'noTransfer'
                                              | 'waitingToStart'
                                              | 'waitingToAccept'
                                              | 'receivingFile';
                                          };
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
