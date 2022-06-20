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
  localDescriptorConfigured: null as RTCSessionDescriptionInit,
  remoteDescriptor: null as RTCSessionDescriptionInit,

  localDescriptionString: null as string,
  localDescriptorConfiguredString: null as string,
  remoteDescriptionString: null as string,

  remoteAnswer: null as string,
};

export type ConnectionState = typeof context;

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
  /** @xstate-layout N4IgpgJg5mDOIC5QGED2A7dYDGAXAlhgLICG2AFvlgHT4QA2YAxMgPIBy7AosgCqKgADqlj4CGASAAeiAMwBGagE4ATAHYALCpUA2AByy18lfPkAaEAE9EAWh1qd1TQAZnsjfI16NGnfIC+-hZomDji6KQUVGDU2BhYeFRQ1ADuYABGAEq8yNSCYGAATiEJ4bGFYCQE6FAACgXF8WGE6EwAyrwAgtkA+rVcXJk9bJw8vACSHJLCouGSMggqAKyy1MZqrvJG3ip68noW1gg2CqtqSj4qGmqnrrKBwU2JxGSUNHGhiTWpGdm5+UUSs0MNRYEUAG74bBwWLkEihejlSq4SDtLi8YYACU6owAMj1xuwOjjkFxpiIxC15oh5PZFEsdBolDcNM55LJZCpZIcaUZqLI9GolkslM4lMylmyVA8QEDnhFXtFYk9qsk0lkcnkGnKymDCpDobBYfCsIjsBUqqiKCawPRxuhYLh4dDqBhWPl0OTZlSkNIaXo9I4jCpnIHzgHWToeQglPTBRpDEsNvJnDolDoZTqWpE3jEPqUkj8Nf9tSqWqCIVCYdaEa6PUxiHBYCQYF7KRJfQstko9E5mam-KmLrtowolmsdDoVEoGVtfGo1Jmyy8ou8y991X8tYDl+gK-qq0aAGb0VApI2CKEAayYYNwAFdBMg4QjOrBOpiRLg23NO4gFyo1BLHspg6MBbhqHoKjRjYWzUCG5yxhowFLL46YaEunzhDmSr5s0G6-JqAKNFh5Z6gaMInmeF7XreYAPk+L6mm+nRtPQJDgmAP4+qAXamM4fYhmywpJoK0FWLYcEIeKngoWhjKYQWK65sqpEEcW24kUpe7kYe1BUee1Cfo6SJVEkrBHkeRRMBAGAxFQ4KoFeeYWiiNioJZRTcR2vH-t4-Kxs4072HobhLOYEmLAoayGJOeiinc5yKcCCqrnm65qoRJY7qRIK6Ya+mnoZxm4KZqoWVZhRohiuKsMgnT4gAIlwbTIJk4y1LwrCZN5np-gg1zjnokpLCYwrOGoVxXNG7KAe4mhMmKQUiRhQSyruOFrmpmUacRWZ5ZWBUGUaJWpCQlI1AAYqghSdA6aRVcguLjFw7AYjibQAOqDL11IIOcAkhl4-GhpKBjRkyqwBsGw3eGmIrJfKm3pdtRZbntu77hRx5FSdX5nRdUDXcUTG2kwNamq66DumAfVCBSv6+f9qjUPoo1Cs4Wj7Fo0ZgYoyzaLIU7AUo7jSmt+2pSpeFfDt6OlrlOmHZRuPUMg9D4LTpUpOdqrExV1mYqwHQ9Kwl2XT9vozO2dN+ggpgJn2zIBrGorxqObKswODjikK3hLIj2GKltBbqfLOXaVjenHWrGta2VkB3bAD1MB932ZFwjU9EbHS-f1pjqGso1JgKIpi2oEOyAJ6YXD4KyMrS9wSxtwco6HctEQrkf5Sr1Gx5r6Da7rSTE8+Nr0OTpOIm6Hp50zpgcvBHKsmyDuGNykV8-Bo1csL8Vi4H2at6p7do53EcpVHR2q9auCqvp+CMLwhTwrAlXULgL8OpVmRgAAjveOAuAmAVAAFZhEgHPO26xq6QSZAmSCo0DiRWGqscUu8fD2AUs3RWyMT74Q7tlLSl8e44z7rfe+R5H5gGfq-d+n86FFF-gAoBTAyDQkELgWh38vJWwZjxaBoY1D8kgqLcKXhhpLBmgXfkrhgzqElFXAOODtJ4JlvfTc59iHyivr3QyFDCxUKfl-N+RQKzoAgCPahNk7K0HQI5ZyasW5pXwbLM+RDJa6LIfouEd9DHUO4aYwo5jLFXWoQgByqBsBmQwAAbWcAAXSgQsAMihJqSPjJOYUG8jieCFvBAwwFAxeF8JzQ+ylcIZXcZpTxpDCrkN8ZQgJJj35ggsVYxgTAiiFBunkdiuAjw3QALZONwcfdRhZNEeMxnUmOBjvhGJoS0sxbTQlE3CZE6J4R4lJL4d6HydsbhKGoJzWkrgxSjQirkhMjhdhC3jB4JCyjHhjJcRMsOWjanK28UaeZyRFmBPfpebAV5LoBNQG0WmEA6IWMBUw-+gDHTJMQHDZQhh9jnIXCmJQM0JqOHZDoKukNAy7EXColKaiqlTJqTM759SfFVCacYxhwT0CoDhVVVZYLGDIoQPFAS9yrg3GMBcqRkUZyOB8KyYwgoAzOGeetV50sqVZRpYrLx9LfmNP8cynhrL2XLKqsRSF7Swk8r2TbP6KYoJrCuOmRRzJ5AXGjBK6gPhZA9lMOyYU05ylS0qajalGN1WzJvtqhZzSWUE1VLwCFTpCjAN4JkD6FshjEmyLylMDgYqoSdbK3NUZIrGGQkBEU6ThT+yFn6ylgbVXBu7nSuZ4b-mRr1dGpIsbOjYA4cA9NGIk0pstvTfZtsUlJjWOyVw6hpynJxUWkwjgVgCnlSsVwvgm4vNUeMlVu0u4kMbWGxlOqllRoqNCfAkIzXMFsjQSJjjJY1tPkGvdOjQ0NKPRG3VQTqBnrABejpYAIn2KiTE9AOzM1OuEYSka+hMEChyTSG5BT7kLSdfIBVD7t21t3RfV9B731+M-Settv7-1Xq6YUHpwTBD9MGYUEZmG3k7vDto3U+GGWEZbV+9+pHL3rMYEBxyWyWjgYtYzQRrJqD+2QqobwHhfAzSQ3c-QqGnnVqw0+utL62MHmvgR1ULBaptC4MMDg3A+CTHYJmhMxzNDDSdchNCE1owbA0EBLYnNzioWnAmdTTHsMsa+bpvRsAbE0EdJaUZW7-OaZw6xsi7H4BiYEV2Sc-MGRuFFOydDtJoypP5MDDmCgQxTj88qgLnzdxhfssBxx5Avw2ATdgGwEyDnW3EwsMa44biiV2IS2Mhajg6CCsoAMCgoK6F8GVgNsXAtVe6b0mjVQ6MjPq46RruBmutdtu1lLiAxrCK5OmD1xhDBSujKNRwsYFx0gcPFFYgQ1psogHASQjGVJ0HNcOy1-VYKc2UEmLB1wthOtDDBfQqwrgevcKg0KSZpshwIdU+tl9zTIiSPUXD4ndsHIWCcccuhXAinCqLSaU4YJVwEnsdQZ2FwOHUGSzdFKNNI+fVjhLwWtXjwThATNRgCdChnCdmc8rkFHGGicwpkp2T3fFKtJnSMWduLZ-Fg6nPjS1lQLPZLuOaRiP5ALcUzIjCigQ-bfyQtRZKOMKLd1CO26s60+ztX2MNemkzYyYRDImQsjZByLkFPewGCgj2LQ1whZOow848rs3KshsS3ka8vLxS9gXDOdk6ZPCBiubYKcTtdCEr8FyeKARyWK5i47uLQXXcx1OmjsyNQDaFF5Sbpwi1hxCgZ+JXJrh+T6GnAlEwFxStl6DhX5XTvVdK3V7X-GOtCbEyTg9FvaY3Xp9CuhoU5xu9yE5KzKCRf0NchFNce3riNGT+r9HVWp1596xumPBEK-xy+EubOeV6YxeIGFG58KPqZy+BZKl4K5j4x6V5zbx4z435fi8rISKDDTypdYTRTQaDRiFwerwyjTG4kqEpn7vKEJqoNpQF9zqwDxDwL43RN4QZwRC4+AQShjA5oFXCswchCiGDLAeDTgbqKrRZgET5V60rEGGSkHxz14ogQBL68LfYdY0imDHLZYLhuBMj2Y74IAR5upHbjYhgk54HMZx5EE16qwiGDztpXQP5TwQapgnLsinDXaA5zpHA-7ubZLDRW7xTy48HM7j4X4CGQGGEkFxyDyZqhiAR+62FbD2EzThSsxTiyDiISJwK6EVbTJ+HX76bHocofyGrMKIrfg66jo0iphuZBTDbe5FE9hf72ycxuYbATQpgMhgSjRJGx4pEGFpEcZMrEbfqrIAa8r+xSZHbDbIQcHnAzRVzHJTpiIMgerXDiwgFHzeGTKX6CH+EdEZGGqJ4grco0IQpQp9HXDwQzikrxTeBDi4opgiLh4eCiIziM6eHl58E+EQFtF6ZrFEaZFsocrJ4S6BgJScyOqC55YHESLITLS+CBjNHgH6H7pCFc6cYPzcZmJ34dpxokAJrBEbBrCQQeqhgipzjSJ8ilKeBshaAMhCiQn8HPEwmrFwmdGZHIk1CdrdpgCcL7GAQiRpisiGA9jpjSJxFAT2CgxciQaTQUlPHQl4awnGjwkAobG8a9H5FWrypBjh7nBpiTYchjFignJBRTH9azFilLG+EvEhbSl0mGot7oYnIeDDauBHE57-SaDuZpjuGpjLRzH3GgEzZQmtHUntG0lJC8ppiKCnK2kXImAuaeyoTe5Jhsh+BpiGkfK+mSk0kPzoD4CwDkCQBjycbWaSboaSKcg9giixhAnCIgmSgcH6AZij4LGPFGlUkpn+nUBYApAAAEEWKIbZ8gwR-JE0NwYkU4E0hgvMExRO+goUyYJWiZBBKOTZrxSW0he2A0hcCBb+kok0YeME3qTgGwg4qY3uk0UeSq3plJEpOm2MsBbgUmI0SBm500kUNgIYqejyKwihK6NZ8xFSiOZ5yZ2O-CuuxwIo8EtpxOTq7B5Oj5vgaSrgsGJeCg7Idx72p54pyAvKNgBgIFRO6epOugqhNgKwbmdIvsypAYugM56FWaWFH+JOEF+Fw2UGCYQsaeyEegZ+KI9GVAlovOip-U2gwobqtI6YDclOlRLp1hpw+wC4pwZ+R450jAEAsaOovKgsjgU68UnJ5wCmkUYebqjRVcnI7gsRn5npdZ0QlF0UhONF4FZO+FQotyR+qgE0XgwEZKgQQAA */
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
                                  on: {
                                    SET_LOCAL_DESCRIPTOR: {
                                      actions: 'setLocalDescriptor',
                                    },
                                  },
                                  invoke: {
                                    src: 'createOffer',
                                    id: 'create-offer',
                                    onDone: [
                                      {
                                        target: 'waitingForAnswer',
                                      },
                                    ],
                                  },
                                },
                                waitingForAnswer: {
                                  tags: ['hostOffer'],
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
                                    onDone: {
                                      target: 'waitingForChannel',
                                    },
                                    onError: {
                                      target: 'waitingForAnswer',
                                    },
                                  },
                                },
                                waitingForChannel: {
                                  on: {
                                    'channel.onOpen': {
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
                                    'channel.onOpen': {
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
                            'new state 1': {},
                          },
                          onDone: {
                            target: '#ConnectionMachine.terminated',
                          },
                        },
                      },
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
        setPeerConnection: assign({
          peerConnection: (c, e) => (e as START_PEER_CONNECTION).peerConnection,
        }),
        setLocalDescriptor: assign({
          localDescriptor: (c, e) => (e as SET_LOCAL_DESCRIPTOR).descriptor,
          localDescriptionString: (c, e) => encodePeerConnection((e as SET_LOCAL_DESCRIPTOR).descriptor),
          localDescriptorConfigured: (c, e) => ({
            ...(e as SET_LOCAL_DESCRIPTOR).descriptor,
            sdp: (e as SET_LOCAL_DESCRIPTOR).descriptor.sdp.replace('b=AS:30', 'b=AS:1638400'),
          }),
          localDescriptorConfiguredString: (c, e) => {
            return encodePeerConnection({
              type: (e as SET_LOCAL_DESCRIPTOR).descriptor.type,
              sdp: (e as SET_LOCAL_DESCRIPTOR).descriptor.sdp.replace('b=AS:30', 'b=AS:1638400'),
            });
            // console.log('PROCESS', e);
            // const targ = e.localDescriptor.description;
            // console.log('PROCESSe', { targ });
            // const internal = {
            //   type: targ.type,
            //   sdp: targ.sdp.replace('b=AS:30', 'b=AS:1638400'),
            // };
            // const inner = {
            //   description: encodePeerConnection(internal),
            // };
            // const output = encodePeerConnection({
            //   ...inner,
            // });
            // console.log('PROCESSe', { internal, inner, output });
            // return output;
          },
        }),
        setChannelInstance: assign({
          channelInstance: (c, e: any) => e.channelInstance,
        }),
        setClientAnswer: assign({
          remoteAnswer: (c, e) => (e as CLIENT_ANSWER).answer,
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
          // try {
          //   console.log('DECODING CLIENT ANSWER', { answer: (e as CLIENT_ANSWER).answer });
          //   const desc = Base64.decode(((e as CLIENT_ANSWER).answer as any).description);
          //   const decoded = decodePeerConnection((e as CLIENT_ANSWER).answer);
          //   console.log('VALS', { desc, decoded });
          //   c.peerConnection.setRemoteDescription(decoded);
          //   return decoded;
          // } catch (err) {
          //   console.log('ERR', err);
          // }
          // return null;
        }),
        createRTCPeerConnection: machineService<ConnectionState>({
          serviceName: 'createRTCPeerConnection',
          run: ({ onCallback, event, context }) => {
            const peerConnection = new RTCPeerConnection({
              iceServers: context.ICEServers,
            });
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
              return onCallback({ type: 'channelInstance.onopen', this: _this, ev: ev });

              // onChannelOpen();
            }) as any;

            channelInstance.onmessage = ((_this: RTCDataChannel, ev: MessageEvent<any>) => {
              console.log('>>HOST.onmessage', { ev: ev });
              return onCallback({ type: 'channelInstance.onopen', this: _this, ev });
              //onMessageReceived(event.data);
            }) as any;
          },
          onEnd: (event) => {},
          onReceive: (event) => {},
        }),
      },
    },
  );
