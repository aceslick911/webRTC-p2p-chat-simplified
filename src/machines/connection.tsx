import { assign, createMachine, Event, EventObject, send } from 'xstate';
import { log, sendParent } from 'xstate/lib/actions';
import { isPromiseLike } from 'xstate/lib/utils';
import { machineService } from './helpers';

type ValueOf<T> = T[keyof T];

const context = {
  ICEServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
  ] as RTCIceServer[],
  channelLabel: 'P2P_CHAT_CHANNEL_LABEL',
  peerConnection: null as RTCPeerConnection,
  channelInstance: null as RTCDataChannel,

  localDescriptor: null as RTCSessionDescriptionInit,
  // localDescriptorConfigured: null as RTCSessionDescriptionInit,
  remoteDescriptor: null as RTCSessionDescriptionInit,

  localDescriptionString: null as string,
  // localDescriptorConfiguredString: null as string,
  remoteDescriptionString: null as string,

  remoteAnswer: null as string,

  ICECandidates: [] as RTCIceCandidate[],
};

export type ConnectionState = typeof context;

interface ICE_CANDIDATE extends EventObject {
  type: 'ICE_CANDIDATE';
  candidate: RTCIceCandidate | null;
}

interface SET_LOCAL_DESCRIPTOR extends EventObject {
  type: 'SET_LOCAL_DESCRIPTOR';
  descriptor: RTCSessionDescriptionInit;
}
interface START_PEER_CONNECTION extends EventObject {
  type: 'START_PEER_CONNECTION';
  peerConnection: RTCPeerConnection;
}

interface CLIENT_ANSWER extends EventObject {
  type: 'CLIENT_ANSWER';
  answer: string;
}

type EventTypes = SET_LOCAL_DESCRIPTOR | START_PEER_CONNECTION;

const encodePeerConnection = (descriptor: RTCSessionDescriptionInit) => {
  const encoded = Base64.encode(JSON.stringify({ description: Base64.encode(JSON.stringify(descriptor)) }));

  const decoded = JSON.parse(Base64.decode(JSON.parse(Base64.decode(encoded)).description));

  console.log('ENCODING', { descriptor, encoded, decoded });
  return encoded;
};
const decodePeerConnection = (desc) => {
  return JSON.parse(Base64.decode(JSON.parse(Base64.decode(desc)).description));
};

export const ConnectionMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGED2A7dYDGAXAlhgLICG2AFvlgHT4QA2YAxMgPIBy7AosgCqKgADqlj4CGASAAeiAMwBGagE4ATAHYALCpUA2AByy18lfPkAaEAE9EAWh1qd1TQAZnsjfI16NGnfIC+-hZomDji6KQUVGDU2BhYeFRQ1ADuYABGAEq8yNSCYGAATiEJ4bGFYCQE6FAACgXF8WGE6EwAyrwAgtkA+rVcXJk9bJw8vACSHJLCouGSMggqAKyy1MZqrvJG3ip68noW1gg2CqtqSj4qGmqnrrKBwU2JxGSUNHGhiTWpGdm5+UUSs0MNRYEUAG74bBwWLkEihejlSq4SDtLi8YYACU6owAMj1xuwOjjkFxpiIxC15oh5PZFEsdBolDcNM55LJZCpZIcaUZqLI9GolkslM4lMylmyVA8QEDnhFXtFYk9qsk0lkcnkGnKymDCpDobBYfCsIjsBUqqiKCawPRxuhYLh4dDqBhWPl0OTZlSkNIaXo9I4jCpnIHzgHWToeQglPTBRpDEsNvJnDolDoZTqWpE3jEPqUkj8Nf9tSqWqCIVCYdaEa6PUxiHBYCQYF7KRJfQstko9E5mam-KmLrtowolmsdDoVEoGVtfGo1Jmyy8ou8y991X8tYDl+gK-qq0aAGb0VApI2CKEAayYYNwAFdBMg4QjOrBOpiRLg23NO4gFyo1BLHsIayKKaghkK0Y2Ay1DTisehuLGxhjkunzhDmSr5s0G6-JqAKNOh5Z6gaMInmeF7XreYAPk+L6mm+nRtPQJDgmAP4+qAXamM4fbyBckp7G4yzQbB8ECkhphcvISxoQWK65sqRG4cW26EfJe4kYe1Dkee1Cfo6SJVEkrBHkeRRMBAGAxFQ4KoFeeYWiiNioGZRQcR2XH-t4-Kxs4072IhshLOYViINJayGJOeiinc5xycCCqrnm65qnhJY7kRIJaYaOmnnpBm4EZqqmeZhRohiuKsMgnT4gAIlwbTIJk4y1LwrCZB5np-gg1zjnokpLCYwrOBBWgaNG7KAe4mhMmK-nCksGgJfKmFrspaWqQRWbZZWuW6UahWpCQlI1AAYqghSdA6aTlcguLjFw7AYjibQAOqDF11IIOcvEhl4shstcsZDdGviOCY2xchcYo3CtGGKutBYqVu227vupHHvlh1frCOBXkk12wLdlnWbQ6B2Q51DwsTRQ2BQ+NfT1AqON4xhbM4Hhsgy0Y+TNPiiqKyzCstQSyrua0pRtRao6WWWaXtZHY-puMM9gBM1ETJNFIUl15CxuBHpdAC21M3XTatXkzXkICz1Bs5DnMpjJUZhYs+zKPsnj6Jo9hKIY8PZojUvI5tsuZRpGPaQdKuGSkJ2qhdxT0baTA1qa9qOs6MRuh61t+j9OirL4rgLvsUX6NGRcaHB1w6KNA0c8KgcKVhqUy-hcuRzlSsUdQyD0PgYDoEV8enVASelRZmKsB0PSsGdZ2fb6Mztt1NumAmfbMgGsaivGo5stQ9eTg44pCt4sliztSWKdhXxh53EeJVH+3KwPQ8j8VkBaxZr0fZkLgdUegzw6Pnbi6g1hDSTAKEU7h1Bg0BsoNMPgNArEZLSe418JbByUqHDuGV1Ivx7ljPuH9h6jwTkkJOz4bT0DTinO0DonToBdLnYe4CaQphrq4RCQp1DqHgVXEKx8hT6BBnsc4V9Hjy0lngnCj9CE31fr3PS1pcCqh0vgRgvBCg0zKtQXAeiHRlUyGAAAjveOAuAmAVAAFZhEgJwhAKFAK6CWnodQPgDhuxhsoDwk5jAhinEoFut827S03E-Ih8oVGkLUXCDRhYjzaLALo-RRRDHGNgKYixVjHRMDINCQQuB0kmPcivCkv4N6c17JOEUXIQohQQW7Uw4o4KSlcELRC-EMzYNkbg++miolKPRiQvKfd1GaJSTo7JBiwToAgNQ1JpMaC2XsjEG+cihmFhGWpZR4yY5TOSakspOTMkLKWedVJCB1nYGMhgAA2s4AAus47wqxuZLSMMYVQNxJpDVWFyXYA1WSeCZNI8WAzkryIfgQ-ZYzFbxKNMc74My0lzIucPK5E8Vk6z1oIA2RtCimy2YM9uey0byziRMhJVRpmnMxYUCsizlmMFuRTVA9zwjPLeZU70nkC4bF4pyAaEY-BeBUACrkcFOQ9g8BcUUsg+kyI0tsil6UEXUsOcrVFyR0VnIMZedWZ1TmoDaNi6iizDVFDMZY6x7zQxwSuLSAwNwezTkmpg6goYGRsjTLSLYi5+lqvJZEzVVLu5ItpSixJDLZkZOZegVANryqXNNYwd5IidDCkaYFZVUFWmc1WGBDkYoi7di0GE9V4atpd2IdGo5caTkJvKUmlNTKmAEQtay65mb+Vr2+tw4ubSVishFLGCaRat6lvUGoQMOatABBDYlGt+DKX1tiTqyZza0WMsTcdcevBzVOkKDY3gmRXpLyGMSbIziUyGGoFoK4oYrheHZK7I47JORAXmssBQ4L1DVrDeuiNm7dSNt1bu-V+622HtVMezo2Bik2NvRiC9V7l5CCqZxAuexexgXFH5GcpwlCTUBsXAwKZtAGDcEtYDMKdko2iQcyDO76UtoxQeio0J8CQj7cwKyazOVUzJYxjVdbn5brY3SpJe7W3nOZTxsAfG2VgA5XZblLReX3pkr2VQ-0hopj8tyVpgLZXTjZoqzmDG74SfDjEiDB437sbkzBhTBjlOqYE0wfFzLCVVGJaSnB4na0OdY851RsaOPya43Brz-HcXsruQ89AOmB3VILimfykU30OElPoSc0qgVyqs3NZVtmImgck454iMnotuZYFVNoXBhgcG4HwSY7B70JiUE4LwIUBK+HAuR4CPqloySHEKb2lWkYKPhZGhtkXkWrJiFnFE-cQt2bCyxxFy2Y33sCR0+uYE2RjlpLzPY-J31CjcMYVM0oV2rRA-NjdUnwirfJpTGI5Avw2DPdgemu5nHDXHDcJMnjAxgQu27eugEexUc8boXws2Q6vbA+9lovnCi6380Sk21BfuOn+7gQHOzBWr0ywsYaahZXpmh1yWaU6jhDUcLGBcdIHAxRWKj2FwyMe1YwEwcYpJhg4jquMOqnReBkgy7hrsfhlCs9GvOfhzPbCBTgvsJHIYRTAT0IEMWyaIBwEkGJxSdB+3YYFevAuNhuFK4cA4a4Wx+KhmgvoIFvX3ADQkkmXnTHFFasjuaZESR6iY4pzhwVCwTjjl0K4PX-FDC6ClW7E4rh7brEMNcDnc6A-2d29q6N6dbTfwgPeow8ehQkb3oNHxRwBo+oMCNdk3PxSi1Vaul7cK3uC4Vvt0viJUB5zlzHmk-txyciGkRsuSrJp8zTGW5p-sfBYK7890L1Xwt7cxsaBEh3rhAUZMydwZ3OSmaOCcXsBgDCijTCC4CneoWhq3+jmrEW98x2NVbMftuFg9h9aJjlxvqqBFbp5Tjby6BFx+BcgxTLob4Ixv694C6f7RzKxHSh7GQ1BTyFDOJGB9aaCCxaD8IASTSZ7KqeLiiuAmAXBTgF47ajLF77YxxHRjyJyXS-x4F-7fRnxPozj7DcxCjnBp5HAciAT6C6DsyAoijXAMHb5F5RosEYGqzkD4yEzmzcHW6Do9TODRgQ5AQyQz5LSTg5oIEv7d7IH84f677oF9xsFULnSXS0IH48E9T5ZPo5rDSDgiiVxuwiyGG5ozjgxmHyHv477MFf4qGOjOI2BXBer8gODOArDnAJgQoBhhEoE2GRF2F6TkJfzsHUKXS4G6ZbBK7uCsiGChgu7RjaA1xFyJgp4TbTjr4WGb7bYKFMFKFRFkKDwULl5cGlF9bshBpuBMiNyiFyCK5aClr7C678SZHWERHdG5FGj5GULjw0KMK6apg+rfrsjs5Jhpj6FLSBEIRwICgXCLG7KoG2EuZ5F9Ejz3qvp7EcgHFbBHFkZmaKCTiNI7AzhDgG5PZIEdHhGKFLY9GybxpxaKZZKJp2r5LfhuE1LLD8jsicy55zru6tIjHHydKjQKDBGmDXHMZdEQmrHGhuZaIeZYq9pJbsTIl4ajRrDGZeD4Z7DijkYzhK7aAX60j+xFwklB6LbSbKGubQmpp5DXgZppLmrYqOq9jATaAODI6BRfFfqwz8gvqAz+z8TeDBqIFBxWE3HZErH3ENYSlMrUDJqprOIXC05GEI5Q4+DnDRir5PqGCaDCpO4hRCkLbgZ1ZilQmcaSmFE1DHptCnpInaFU40h3aeEpHs6Q4XCTTLC9isgXCUEzjCiTh+l95oHmmUmWkHphlQCIbIZgAlKOqrA7CSGshaB+Cfo0jaCAQhRFwcneDpiCnAlGmglZHLHkmFl6rUkwmeY4AqaJYynPEexjGUHJHwErBcnjgzi8nSRL7dmGmtxzb9ngmimQkWkhlMrOL2COCir66+CeCeK8zTGTjBSu5bABp5m3E5FDnQbUDGxNgthJDHkOD8i+G+qIQz4N6ICIQiqcjTisi7Bpj0E9lblo47lkl7kUl6rHlDRalireASpXluwQS07KopgNKBieBihPmmmDlRZaLoD4CwBqEQC0JuY9ashQKCiAxcj1xBLSps7VxTTIQOCkUDlIXmmxFeDQTshg4bBKnc4oSeL8W7lOaYyxEQTQQhi9iaD7Ad7Ti8JwywXhLblLFyW4aU7y62DpjQQXlOCuABoCypgeCQrm5VZgnICxH3bQTTZrCij7AQShgLg9hCnOU+DQSeI1yBoMgJggozS84ogkpUCWgV6MnU7CxPr8mTgeCAzYlHBpi9hnYjGCg3Dsi85HgnSMAQDHo6gg5sU+r+QxQoKpFNm9RXAJkrDCTuBTgVY6WSzOV+FX4xQOlyoeDeK7zBqBBAA */
  createMachine(
    {
      context: context as ConnectionState,
      tsTypes: {} as import('./connection.typegen').Typegen0,
      id: 'ConnectionMachine',
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
          initial: 'webRTC',
          states: {
            webRTC: {
              initial: 'peerConnection',
              states: {
                peerConnection: {
                  invoke: {
                    src: 'createRTCPeerConnection',
                    id: 'host-rtc-connection',
                    onDone: [
                      {
                        target: '#ConnectionMachine.terminated',
                      },
                    ],
                    onError: [
                      {
                        target: '#ConnectionMachine.failedToConnect',
                      },
                    ],
                  },
                  tags: 'peerConnection',
                  initial: 'creatingPeerConnection',
                  states: {
                    creatingPeerConnection: {
                      on: {
                        START_PEER_CONNECTION: {
                          actions: 'setPeerConnection',
                          target: 'services',
                        },
                      },
                    },
                    services: {
                      type: 'parallel',
                      states: {
                        channel: {
                          invoke: {
                            src: 'createDataChannel',
                            id: 'data-channel',
                          },
                          initial: 'created',
                          states: {
                            created: {
                              on: {
                                SET_CHANNEL_INSTANCE: {
                                  actions: 'setChannelInstance',
                                },
                                'channelInstance.onOpen': {
                                  target: 'open',
                                },
                              },
                            },
                            open: {
                              on: {
                                onMessage: {
                                  actions: 'channel.onMessage',
                                  target: 'open',
                                  internal: false,
                                },
                              },
                            },
                          },
                        },
                        flows: {
                          initial: 'pick',
                          states: {
                            pick: {
                              on: {
                                setupChannelAsAHost: {
                                  target: 'Host',
                                },
                                setupChannelAsASlave: {
                                  target: 'Client',
                                },
                              },
                            },
                            Host: {
                              initial: 'creatingOffer',
                              states: {
                                creatingOffer: {
                                  invoke: {
                                    src: 'createOffer',
                                    id: 'create-offer',
                                    onDone: [
                                      {
                                        target: 'waitingForAnswer',
                                      },
                                    ],
                                  },
                                  on: {
                                    SET_LOCAL_DESCRIPTOR: {
                                      actions: 'setLocalDescriptor',
                                    },
                                  },
                                },
                                waitingForAnswer: {
                                  tags: 'hostOffer',
                                  on: {
                                    CLIENT_ANSWER: {
                                      actions: 'setClientAnswer',
                                      target: 'checkingAnswer',
                                    },
                                  },
                                },
                                checkingAnswer: {
                                  invoke: {
                                    src: 'checkAnswer',
                                    id: 'answer-check',
                                    onDone: [
                                      {
                                        target: 'waitingForChannel',
                                      },
                                    ],
                                    onError: [
                                      {
                                        target: 'waitingForAnswer',
                                      },
                                    ],
                                  },
                                },
                                waitingForChannel: {
                                  on: {
                                    'channelInstance.onOpen': {
                                      target:
                                        '#ConnectionMachine.connecting.webRTC.peerConnection.services.flows.chatting',
                                    },
                                  },
                                },
                              },
                            },
                            Client: {
                              states: {
                                waitingForOffer: {
                                  on: {
                                    HOST_OFFER: {
                                      target: 'createdAnswer',
                                    },
                                  },
                                },
                                createdAnswer: {
                                  on: {
                                    ANSWERED_HOST: {
                                      target: 'waitingForChannel',
                                    },
                                  },
                                },
                                waitingForChannel: {
                                  on: {
                                    'channelInstance.onOpen': {
                                      target:
                                        '#ConnectionMachine.connecting.webRTC.peerConnection.services.flows.chatting',
                                    },
                                  },
                                },
                              },
                            },
                            chatting: {
                              type: 'parallel',
                              states: {
                                fileTransfer: {
                                  initial: 'noTransfer',
                                  states: {
                                    transferRequest: {
                                      on: {
                                        rejected: {
                                          target: 'noTransfer',
                                        },
                                        acceptTransfer: {
                                          target: 'waitingToStart',
                                        },
                                      },
                                    },
                                    sendingFile: {
                                      invoke: {
                                        src: 'sendFile',
                                        onDone: [
                                          {
                                            target: 'noTransfer',
                                          },
                                        ],
                                        onError: [
                                          {
                                            target: 'noTransfer',
                                          },
                                        ],
                                      },
                                    },
                                    pickFileToSend: {
                                      on: {
                                        sendTransferRequest: {
                                          target: 'waitingToAccept',
                                        },
                                      },
                                    },
                                    noTransfer: {
                                      on: {
                                        sendFile: {
                                          target: 'pickFileToSend',
                                        },
                                        peerSendingFile: {
                                          target: 'transferRequest',
                                        },
                                      },
                                    },
                                    waitingToStart: {
                                      on: {
                                        TRANSFER_START: {
                                          target: 'receivingFile',
                                        },
                                      },
                                    },
                                    waitingToAccept: {
                                      on: {
                                        START_TRANSFER: {
                                          target: 'sendingFile',
                                        },
                                      },
                                    },
                                    receivingFile: {
                                      invoke: {
                                        src: 'receiveFile',
                                        onDone: [
                                          {
                                            target: 'noTransfer',
                                          },
                                        ],
                                        onError: [
                                          {
                                            target: 'noTransfer',
                                          },
                                        ],
                                      },
                                    },
                                  },
                                },
                                messaging: {},
                              },
                              on: {
                                CLOSE_CONNECTION: {
                                  target: 'finishedChatting',
                                },
                              },
                            },
                            finishedChatting: {
                              type: 'final',
                            },
                          },
                          onDone: {
                            target: '#ConnectionMachine.terminated',
                          },
                        },
                      },
                    },
                  },
                  on: {
                    ICE_CANDIDATE: {
                      actions: ['alertICE', 'updateICECandidate'],
                    },
                  },
                },
              },
            },
          },
        },
        terminated: {
          type: 'final',
        },
        failedToConnect: {
          type: 'final',
        },
      },
    },
    {
      guards: {
        hasValidAnswer: (c, e) => c.remoteAnswer != null,
      },
      actions: {
        alertICE: (c, e: ICE_CANDIDATE) => {
          console.log(`❄️ ${e.type}`, e);
        },
        setPeerConnection: assign({
          peerConnection: (c, e) => (e as START_PEER_CONNECTION).peerConnection,
        }),
        setLocalDescriptor: assign({
          localDescriptor: (c, e) => {
            c.peerConnection.setLocalDescription((e as SET_LOCAL_DESCRIPTOR).descriptor);
            return (e as SET_LOCAL_DESCRIPTOR).descriptor;
          },
          localDescriptionString: (c, e) => encodePeerConnection((e as SET_LOCAL_DESCRIPTOR).descriptor),
        }),
        setChannelInstance: assign({
          channelInstance: (c, e: any) => e.channelInstance,
        }),
        setClientAnswer: assign({
          remoteAnswer: (c, e) => (e as CLIENT_ANSWER).answer,
        }),
        updateICECandidate: assign({
          peerConnection: (c, e) => {
            const event = e as ICE_CANDIDATE;
            if (event.candidate === null && c.peerConnection.localDescription) {
              c.peerConnection.localDescription.sdp.replace('b=AS:30', 'b=AS:1638400');
            }
            return c.peerConnection;
          },
          ICECandidates: (c, e: ICE_CANDIDATE) => {
            return [...c.ICECandidates, e.candidate];
          },
        }),
      },
      services: {
        checkAnswer: machineService<ConnectionState>({
          serviceName: 'checkClientAnswer',
          run: async ({ onCallback, event, context }) => {
            console.log('DECODING CLIENT ANSWER', { answer: context.remoteAnswer });
            // const desc = Base64.decode((context.remoteAnswer as any).description);
            const decoded = decodePeerConnection(context.remoteAnswer);
            console.log('VALS', { decoded });
            await context.peerConnection.setRemoteDescription(decoded);
            onCallback('ANSWER_SUCCESS');
          },
          endEvent: 'ANSWER_SUCCESS',
          onEnd: () => {},
          onReceive: () => {},
        }),
        createRTCPeerConnection: machineService<ConnectionState>({
          serviceName: 'createRTCPeerConnection',
          run: ({ onCallback, event, context }) => {
            const peerConnection = new RTCPeerConnection({
              iceServers: context.ICEServers,
            });

            peerConnection.onicecandidate = (e) => {
              console.log('>>onicecandidate', { e });
              console.log('ICE', e, e?.candidate?.address);
              onCallback({
                type: 'ICE_CANDIDATE',
                address: e?.candidate,
                candidate: e?.candidate,
              });
            };
            onCallback({ type: 'START_PEER_CONNECTION', peerConnection });
          },
          onEnd: (event) => {},
          onReceive: (event) => {},
        }),
        createOffer: machineService<ConnectionState>({
          serviceName: 'createOffer',
          run: async ({ onCallback, event, context }) => {
            if (context.peerConnection) {
              const description = await context.peerConnection.createOffer();
              console.log('ORIGINAL offer', description);

              onCallback({ type: 'SET_LOCAL_DESCRIPTOR', descriptor: description } as EventTypes);
              return;
            }
          },
          endEvent: 'SET_LOCAL_DESCRIPTOR',
          onEnd: (event) => {},
          onReceive: (event) => {},
        }),

        createDataChannel: machineService<ConnectionState>({
          serviceName: 'createDataChannel',
          run: ({ onCallback, event, context }) => {
            const channelInstance = context.peerConnection.createDataChannel(context.channelLabel);

            onCallback({ type: 'SET_CHANNEL_INSTANCE', channelInstance });

            channelInstance.onopen = ((_this: RTCDataChannel, ev) => {
              console.log('>>HOST.onopen', { this: _this, ev });
              return onCallback({ type: 'channelInstance.onOpen', this: _this, ev: ev });

              // onChannelOpen();
            }) as any;

            channelInstance.onmessage = ((_this: RTCDataChannel, ev: MessageEvent<any>) => {
              console.log('>>HOST.onmessage', { ev: ev });
              return onCallback({ type: 'channelInstance.onOpen', this: _this, ev });
              //onMessageReceived(event.data);
            }) as any;
          },
          onEnd: (event) => {},
          onReceive: (event) => {},
        }),
      },
    },
  );
