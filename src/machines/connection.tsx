import { assign, createMachine, send } from 'xstate';
import { log, sendParent } from 'xstate/lib/actions';
import { isPromiseLike } from 'xstate/lib/utils';
import { machineService } from './helpers';

const context = {
  ICEServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
  ] as RTCIceServer[],
  channelLabel: 'P2P_CHAT_CHANNEL_LABEL',
  peerConnection: null as RTCPeerConnection,
  channelInstance: null as RTCDataChannel,
  localDescriptor: null as string,
  remoteDescriptor: null as string,
};

export type ConnectionState = typeof context;

export const ConnectionMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGED2A7dYDGAXAlhgLICG2AFvlgHT4QA2YAxMgPIBy7AosgCqKgADqlj4CGASAAeiAKwAmAOzUAzAAZ5KgCwAORVrUA2FYZ0AaEAE9EAWkOLD1fWrXaAjLq1bDbgL6+LNEwccXRSCiowamwMLDwqKGoAdzAAIwAlXmRqQTAwACcguNDadDF8Enp8AC8EpgBlXgBBTIB9AAUuLnTWtk4eXgBJDklhUVDJGQQfNWoDLXlZRUWATlkdNYtrBBsVeVm3NS112TVlw0NNf0DYkMIwskoaGOD49ESUjKycvMLb+Iw1FgBQAbvhsHBouQSMF6NF8mASLhIEwMKxcuhRiJyhIkNJEG5FK5qLIVG4PPt5G4dFoVlsCYo3E43Ct5DoVDodIS1uzriAindiI9ItF-gR3sk0plsrkCgKAeggaDwZCKDCsHDUBjUWE4LASDAseN7pMCZzZNRDLJZG5Fj4vLIvPSEISmYzWecVg4yYs+fLQuEnlEXsUEpKvjLfv77kr8mCIbBqAAzeioJKJwTggDWTGBuAAroJkNDYU1YE0ABIiXBGnGYvFTRTLElc8lWnSuRQ6eTOmyE6j7RQrFYeE7eFaGLR+sX3QMikN3CWfaU-OUzwHAuMqxMptMZ7O5sAFosljVlpr1egkEFgWsTBsE8mzIf7NRua1LPQ9qy2fuD4ejjojqGBOU4BPy64PBEzwzkuUrfLKfyvCUm7xpCu7ptQVawLg8KIuKUCsEmSYFEwEAYFEVAgqgWbBgiSJgDYqDEQUd4mg+CBdloqgjhoE5dq4NrOpoTJuCoDimCsLidis07IbOwowfJcERquSGhhuyoJsmqaYdhuHYPRBFESR+QNFwvCtAAMqwyBNFZrQACJcPUyDpIM7S8Kw6RsbioBTFoigWkBagKO+pzLAsWjOmJ8iqIFXhSVJizWmBNzyUK0HBrBHzwZGa4ZYqqHbjpe5YdWyQkOU7wAGKoPkTToLAKRmcgVmDFw7CWU07D1AA6t0vn1v5iBDrM+y6C4xjDiYzq0isJI+GsFxiXssngdGmVBqKym5apiGbUVWnobpib6ZV1VQHVhSnmA9BMGqsLUGiGJDaanGspaQFKKcCzUgszpWkyizyJolzrCs2jyHJGlQdtC5vHtK4HZBsZoTup3UMgVRgOguFJFVBHXSZpEVqwjStKwNU1YNeJjHW73kloKhOMOXYbCyah6NFP4IOoTKGEY9ggV66zHDDgpw-OOXhsjUao8V2kYYm2P4LjBlGZAjXNaRPX9d0XCOa0ZONG9HHkko1DvosigcrIkMLIoc3qNQE4rF4xwmFobjGBLCpzkpoYqXLBWw2jJXK1jON4xdRP1cW6p3Q9t2aug6K42bI0uqtA4qNoLjkh44kqIDNoDgoYOLBsUN+wGinZbtssIfLhXh0rmNqrgBHJvgjC8PkMKwKZ1C4APTWmekYAAI75nAuBMAiABWISQJn+IukosxejS7vid95i80BLPDmDXjC2lEGFQHDdB0jzeh5LbcnWVnfd0mvdgP3g-D6P38FJPM855MDIBCQQuAv7j1YnTbE94s6HD0KoLskMbS6CArIGKFtVAuEZKDIKrhQq1wUllHat8m75XUo-RWz9MKvzDO-PuY8h4FCVOgCACQaofzIhRUo1FaJY0gtfEhi477kMOk-DGL9oRdzoR-CBTD8gsLYbVD+CAqKoGwEie4ABtNQABdNeUxORujZNabmFxrQl15kXRwbIVDrB0JOGkgsL6HUEQjbuy574UIVOI0qNCpFv1kYw4ewJWHsM4QUfI9UchXlwEmeqABbfhV965CMRmQtSYiqESP8UiQJDC-4KNCUoq6Ki1EaNCDo-R0DjR+XXrbBaRwfbSTWFSGKzMbHslMPob2I5xYbQEak9xYZPGiIVsdHJiZaESnoZ-YJzDMzYCzBwvuqB6i4wgIeVhciJ7T1njhAxiAnGu3EtSaSTZDh0isWcRwYljBHEhg4tkihCFbWlo3UZmTxlbnbpIvJMiCmQIUegVAOzSLFJWbeGpDMOIbFmCYbsgUfRqDWOg3my05heDfM8zkBCBkpOIcM4OXiskTL8VMgJAK5mFOoCCsFZlELrLCcoxghyXRcziraWkVpXBehZDzbYGKvAqBWK2MS1p5DrXSrDNxMtPko1btk8lUJ-kzKCTSgml1eBrNwCQfI89eDpD1jTHojQWj8GhbA9ehwHBWzsb0vQQFvaGBivIY4JJ7bLDQTSUkhhXlS0DsIjJCqw5KsjtMxIsz6WxwSNqpo2BQHzzNW0Q1xraZCBgexLOQFlDknUBoZYUlemup9iSPOHYLEuG8Cof1sqPl5S+Yqsl4bKVqsBfI6gCIIT4DBCy5g5EaBqL4a4oZcqG0hsoc2jurbI3qqBZ2nAYAe3hMYKo9A1EKnaL0Wy8kXpLR2NCqYM+HJLHbGsQOLp3NenvlraO+t+0W6hqnX86RbbqXzq7Uu3tpTGBMEidEwQsT4n5CSSOwlY6H0Px8WG6dqrZ3tuHp+5dfa10bs0RgKpO6jizB9ccVkNJvbeHaSYC9CKekslHLe8D96Q7eJQs+3Jr6oAsBsvULgvQODcD4MMdgO7mYLX0EBflwEpJO15kSbiNoJNDkdJK5mVH4YQdo6Sn51DYBcJoDhBiySZV3tIfKx9k7VOTJ3StcugsRVvjJDaF1h8uTxS5Hg5FlwFPvP0+OwzCoNOUXXTRKI5Bqw2H1dgGwwy6n0ytVMKk1onB2K7GyaaPtAYaFdpyMk3Z5CTj9fi3T1H3OQbo-cP9+QokKMA0iYDSSAs4SC7gELYXhogAi1m9e0XlCaAnCK204kPbOgUI4EcTZ7CEkkqSVzgb0kGag6EBozQ2idG6Bx-o3GRiWpa4Y0wcwHC2w2JyPQChex7AOEce2kq3zknZGBcCIKIBwEkGB7adBWVrbqVMfO1ANggW0NWjQtjeymBZuobQ3N7Ei3GzfINU3CuAioOUSoNQEhsu9s+b6S1dAKCMIds4VtQZclkILGzoVZDg7SR4jz02YxKsehqPCDEIA7sZBaH6awutrFCgfbYQFqBczsacMSGx7buxJ0SkRjan3GZVU9LUGcXuNamBRi0rIWTrBcEsCVzouc89JALwKrSXGDLy5D8n0OjoS+p3dUzQ4y1M0pP9K52xdg6A+ye5mtoLFu+F0pkl3z0bKsWVmNlw4ndNjWGJCcHgHFuH+3FIcrILgmG6xzT3NHvdNol5Hc6hl8IJBJvkNl7onC0hRY7BQTZvxnpcKoUwkqpIaH5S5nLks635eUz7iOmNzqarjg1JqLV88gTmKHjs74govmdHnOK1efDRc0PbQKyeW+p-F77jPFUu-sPjinfvFpvBhXx4ce2pg+uOhJOFSVwFzF+Eb-7PTRuCsqZXx36sSOy4hT3xFN1brhLKBFSBFkm9jAFglgF879W809H8ypVZ1YY1ap6pc8d1yRlAWcsVxIuZAoo9eZQZuJjBxJSRlhHRbRIYQDJtjcH929IDo4NZ8ItZe8oEM1ak5dHwWQ7VCQiRtBRUbRy9EAE85gOt0t9gbQpVL5ctFMU8xlwDyDMIoCY519YCbpE56AECjBudVow9CQlgQJj9JNwo7ZIYOQhdr865DcSD7829fkpDKCsNuwVC841DR9NCrEy4LhNAGlHkFBrRiCydTCJDzCKU4Me4ENmFf4gUAF9kaxZdGYjBuINACdJwojRUOcCQjhuIiQzgD9zEFBPCRlSCzC1MVUmMAj30O1ikV0oV6CYVs13Vuxf8TtFhdcYp1BGk+JedppApoZDCiFRDF9xDl9JC-CCio15kytsxIVtUmV6cIjYVAoBxWlHVRUDAHCK9DhEEkVvYkE1gXkOi3kJsvCwDejfD8j8kijh46UhjA8ucHFa8HlGQgp7cjlpjUFjgNBgIHEsjiUeijMIDGMjjo1ZCoAxjdV9UsMiQrYuxLMuR9hCQBVHxGQ5hBYPA3wgD7BictiA0IcTC9jPi+jDiqVfjCZY1UB41E02UaQ4oPwQIDBxJRUJwME7FFoiRvoyQvRlg3jRcJ1oMGN+ifihiF1u1v1IUsN8dC9bYhwQJMtmZT0CRGjudmjrRWiWTUTm9QCl8sSDiI1Cj6V893xudnUWkwpnQmxtCiQiQFAfRgDFTb8MSVSOT09YMmM2U-8dTmkXBWkMDtgiQmRHR8dRMRx8cxsLTjDdjrT6NbSyp34yhYByBIAE57TJi4EsUrYThSRJUgIAINcHjOQni6jTBstpUm9LSgyPibSvjEwsAkgAACLTZEcstwLDOks4Hbc4QccSQGJow9XFD0-YXM4Q-MwM7I7w-YtTJHS2N-aLD-KKXscVJwIkQWTkbeE9K-PMm-Ps94sXVUu7OM9eSkj7U4d-M4T-aEnYfYYPXpFBb7cSfQVk4NTzK1ZrV7bgq3Uc8Kfcic3mGwSaFQjlUKbwIwLsbsh7NzZU5ANlXnHc0KMcl8r-N8iVVLKkGkLsT1FEpcowro4RECskMCvcyKKCh3cGV2UkTwQQhYTkEnZEEDKgOnNlUGGLZ1CcScMSFwRI6YUVGwsSakJsMkGtAM7aJMKqRgCAbVf0KisGGUtkN2XXIjXmKKOEytPYbQS4EwcHEC7HJ860SCw8mwIKGxQTGzUVJsTY-wIAA */
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
                  tags: ['peerConnection'],
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
                                onOpen: {
                                  actions: 'channel.onOpen',
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
                                  on: {
                                    CLIENT_ANSWER: {
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
      actions: {
        setPeerConnection: assign({
          peerConnection: (c, e: any) => e.peerConnection,
        }),
        setLocalDescriptor: assign({
          localDescriptor: (c, e: any) => e.localDescriptor,
        }),
        setChannelInstance: assign({
          channelInstance: (c, e: any) => e.channelInstance,
        }),
      },
      services: {
        createOffer: (c, invokingEvent) => async (callback: (ev: any) => void, onReceive) => {
          try {
            if (c.peerConnection) {
              const description = await c.peerConnection.createOffer();

              onReceive((event) => {
                console.log('GOT2', event);
              });
              console.log('✅ createdOffer', { description });
              callback({ type: 'SET_LOCAL_DESCRIPTOR', localDescriptor: description });
              return description;
            } else {
              console.log('NOT DEFINED', c);
            }
          } catch (err) {
            callback({ type: 'ERROR', err });
            throw err;
          }
          await new Promise(() => {});
        },

        createDataChannel: machineService<ConnectionState>({
          serviceName: 'createDataChannel',

          run: async ({ onCallback, event, context }) => {
            const channelInstance = context.peerConnection.createDataChannel(context.channelLabel);

            onCallback({ type: 'SET_CHANNEL_INSTANCE', channelInstance });

            channelInstance.onopen = ((_this: RTCDataChannel, ev: Event) => {
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

        createRTCPeerConnection: (c, invokingEvent) => async (callback: (ev: any) => void, onReceive) => {
          try {
            const peerConnection = new RTCPeerConnection({
              iceServers: c.ICEServers,
            });
            callback({ type: 'START_PEER_CONNECTION', peerConnection });
            console.log('✅ Created peer connection', { peerConnection });

            onReceive((event) => {
              console.log('GOT', event);
            });
          } catch (err) {
            callback({ type: 'ERROR', err });
            throw err;
          }
          await new Promise(() => {});
        },
      },
    },
  );
