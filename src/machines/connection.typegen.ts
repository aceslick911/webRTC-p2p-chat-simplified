// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    setPeerConnection: 'START_PEER_CONNECTION';
    'channel.onOpen': 'onOpen';
    'channel.onMessage': 'onMessage';
    setLocalDescriptor: 'SET_LOCAL_DESCRIPTOR';
  };
  internalEvents: {
    'xstate.init': { type: 'xstate.init' };
    'done.invoke.host-rtc-connection': {
      type: 'done.invoke.host-rtc-connection';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'error.platform.host-rtc-connection': { type: 'error.platform.host-rtc-connection'; data: unknown };
    'done.invoke.create-offer': {
      type: 'done.invoke.create-offer';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'error.platform.create-offer': { type: 'error.platform.create-offer'; data: unknown };
  };
  invokeSrcNameMap: {
    createRTCPeerConnection: 'done.invoke.host-rtc-connection';
    createDataChannel: 'done.invoke.ConnectionMachine.connecting.webRTC.peerConnection.services.channel:invocation[0]';
    createOffer: 'done.invoke.create-offer';
    sendFile: 'done.invoke.ConnectionMachine.connecting.webRTC.peerConnection.services.flows.chatting.fileTransfer.sendingFile:invocation[0]';
    receiveFile: 'done.invoke.ConnectionMachine.connecting.webRTC.peerConnection.services.flows.chatting.fileTransfer.receivingFile:invocation[0]';
  };
  missingImplementations: {
    actions: 'channel.onOpen' | 'channel.onMessage';
    services: 'createDataChannel' | 'sendFile' | 'receiveFile';
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    createRTCPeerConnection: 'xstate.init';
    createDataChannel: 'xstate.init';
    createOffer: 'setupChannelAsAHost';
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
    | 'connecting.webRTC.peerConnection.services.flows.new state 1'
    | 'terminated'
    | 'failedToConnect'
    | {
        connecting?:
          | 'webRTC'
          | {
              webRTC?:
                | 'peerConnection'
                | {
                    peerConnection?:
                      | 'initializing'
                      | 'services'
                      | {
                          services?:
                            | 'channel'
                            | 'flows'
                            | {
                                channel?: 'created' | 'open';
                                flows?:
                                  | 'pick'
                                  | 'Host'
                                  | 'Client'
                                  | 'chatting'
                                  | 'finishedChatting'
                                  | 'new state 1'
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
                  };
            };
      };
  tags: never;
}
