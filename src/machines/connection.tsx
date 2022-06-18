import { assign, createMachine, send } from 'xstate';
import { log, sendParent } from 'xstate/lib/actions';

export const ConnectionMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGED2A7dYDGAXAlhgLICG2AFvlgHT4QA2YAxMgPIBy7AosgCqKgADqlj4CGASAAeiAKwAmAOzUAzAAZ5KgCwAORVrUA2FYZ0AaEAE9EAWkOLD1fWrXaAjLq1bDbgL6+LNEwccXRSCiowamwMLDwqKGoAdzAAIwAlXmRqQTAwACcguNDadDF8Enp8AC8EpgBlXgBBTIB9AAUuLnTWtk4eXgBJDklhUVDJGQQfNWoDLXlZRUWATlkdNYtrBBsVeVm3NS112TVlw0NNf0DYkMIwskoaGOD49ESUjKycvMLb+Iw1FgBQAbvhsHBouQSMF6NF8mASLhIEwMKxcuhRiJyhIkNJEG5FK5qLIVG4PPt5G4dFoVlsCYo3E43Ct5DoVDodIS1uzriAindiI9ItF-gR3sk0plsrkCgKAeggaDwZCKDCsHDUBjUWE4LASDAseN7pMCZzZNRDLJZG5Fj4vLIvPSEISmYzWecVg4yYs+fLQuEnlEXsUEpKvjLfv77kr8mCIbBqAAzeioJKJwTggDWTGBuAAroJkNDYU1YE0ABIiXBGnGYvFTRTLElc8lWnSuRQ6eTOmyE6j7RQrFYeE7eFaGLR+sX3QMikN3CWfaU-OUzwHAuMqxMptMZ7O5sAFosljVlpr1egkEFgWsTBsE8mzIf7NRua1LPQ9qy2fuD4ejjojqGBOU4BPy64PBEzwzkuUrfLKfyvCUm7xpCu7ptQVawLg8KIuKUCsEmSYFEwEAYFEVAgqgWbBgiSJgDYqDEQUd4mg+CBdloqgjhoE5dq4NrOpoTJuCoDimCsLidis07IbOwowfJcERquSGhhuyoJsmqaYdhuHYPRBFESR+QNFwvCtAAMqwyBNFZrQACJcPUyDpIM7S8Kw6RsbioBTFoigWkBagKO+pzLAsWjOmJ8iqIFXhSVJizWmBNzyUK0HBrBHzwZGa4ZYqqHbjpe5YdWyQkOU7wAGKoPkTToLAKRmcgVmDFw7CWU07D1AA6t0vn1v5iBDrM+y6C4xjDiYzq0isJI+GsFxiXssngdGmVBqKym5apiGbUVWnobpib6ZV1VQHVhSnmA9BMGqsLUGiGJDaanGspaQFKKcCzUgszpWkyizyJolzrCs2jyHJGlQdtC5vHtK4HZBsZoTup3UMgVRgOguFJFVBHXSZpEVqwjStKwNU1YNeJjHW73kloKhOMOXYbCyah6NFP4IOoTKGEY9ggV66zHDDgpw-OOXhsjUao8V2kYYm2P4LjBlGZAjXNaRPX9d0XCOa0ZONG9HHkko1DvosigcrIkMLIoc3qNQE4rF4xwmFobjGBLCpzkpoYqXLBWw2jJXK1jON4xdRP1cW6p3Q9t2aug6K42bI0uqtA4qNoLjkh44kqIDNoDgoYOLBsUN+wGinZbtssIfLhXh0rmNqrgBHJvgjC8PkMKwKZ1C4APTWmekYAAI75nAuBMAiABWISQJn+IukosxejS7vid95i80BLPDmDXjC2lEGFQHDdB0jzeh5LbcnWVnfd0mvdgP3g-D6P38FJPM855MDIBCQQuAv7j1YnTbE94s6HD0KoLskMbS6CArIGKFtVAuEZKDIKrhQq1wUllHat8m75XUo-RWz9MKvzDO-PuY8h4FCVOgCACQaofzIhRUo1FaJY0gtfEhi477kMOk-DGL9oRdzoR-CBTD8gsLYbVD+CAqKoGwEie4ABtNQABdNeUxORujZNabmFxrQl15kXRwbIVDrB0JOGkgsL6HUEQjbuy574UIVOI0qNCpFv1kYw4ewJWHsM4QUfI9UchXlwEmeqABbfhV965CMRmQtSYiqESP8UiQJDC-4KNCUoq6Ki1EaNCDo-R0DjR+XXrbBaRwfbSTWFSGKzMbHslMPob2I5xYbQEak9xYZPGiIVsdHJiZaESnoZ-YJzDMzYCzBwvuqB6i4wgIeVhciJ7T1njhAxiAnGu3EtSaSTZDh0isWcRwYljBHEhg4tkihCFbWlo3UZmTxlbnbpIvJMiCmQIUegVAOzSLFJWbeGpDMOIbFmCYbsgUfRqDWOg3my05heDfM8zkBCBkpOIcM4OXiskTL8VMgJAK5mFOoCCsFZlELrLCcoxghyXRcziraWkVpXBehZDzbYGKvAqBWK2MS1p5DrXSrDNxMtPko1btk8lUJ-kzKCTSgml1eBrNwCQfI89eDpD1jTHojQWj8GhbA9ehwHBWzsb0vQQFvaGBivIY4JJ7bLDQTSUkhhXlS0DsIjJCqw5KsjtMxIsz6WxwSNqpo2BQHzzNW0Q1xraZCBgexLOQFlDknUBoZYUlemup9iSPOHYLEuG8Cof1sqPl5S+Yqsl4bKVqsBfI6gCIIT4DBCy5g5EaBqL4a4oZcqG0hsoc2jurbI3qqBZ2nAYAe3hMYKo9A1EKnaL0Wy8kXpLR2NCqYM+HJLHbGsQOLp3NenvlraO+t+0W6hqnX86RbbqXzq7Uu3tpTGBMEidEwQsT4n5CSSOwlY6H0Px8WG6dqrZ3tuHp+5dfa10bs0RgKpO6jizB9ccVkNJvbeHaSYC9CKekslHLe8D96Q7eJQs+3Jr6oAsBsvULgvQODcD4MMdgO7mYLX0EBflwEpJO15kSbiNoJNDkdJK5mVH4YQdo6Sn51DYBcJoDhBiySZV3tIfKx9k7VOTJ3StcugsRVvjJDaF1h8uTxS5Hg5FlwFPvP0+OwzCoNOUXXTRKI5Bqw2H1dgGwwy6n0ytVMKk1onB2K7GyaaPtAYaFdpyMk3Z5CTj9fi3T1H3OQbo-cP9+QokKMA0iYDSSAs4SC7gELYXhogAi1m9e0XlCaAnCK204kPbOgUI4EcTZ7CEkkqSfw4EQUQDgJIMD206CsstS1qY+dqAbBAtoatGhbG9lMCzdQ2hub2JFq5wN6SDNQZKFQcolQagJDZd7Z830lq6AUEYXs6hc2gy5LIQWNnQqyBOzfIN53CuaWMyqp6hl8Kr0W3UqYroLQ-TWF1tYoUD7bCAtQLmdjThiQ2Pbd2gO0keI8xdmMSrHoameq9WHjX4cjgtKyFk6wXBLAlc6TH2PST48Cq0lxgy8vA9J6Do64PKd3VM0OMtTNKT-SudsXYOhVsnsyz9ya3YaRE6JSIxtT7weR0WVmNlw4ldNjWGJCcHgHFuB23FIcrILgmG6xzLXSmSXfPRsq86UPNHvBJvkNl7onC0hRY7BQTZvxnpcKoUwkqpIaH5S5nLks635eUx7iOmNzqarjg1JqLVA8gTmObjs74govmdHnOKsefDRc0PbQKruaPu6bfrrPFUc-sPjinQvFpvBhR+4ce2pg+uOhJOFSVwFzF+GT-7PTQuCsqc95HfS92y4hQHxFN1brhLKBFSBQWb4lhc2dU3tPLe9fL8xqrdWMbar1X9zu8kyhkdYvEifxkwk3X7vEqSZYjpbRIYz8F909W8r8yob8Y4fdkQIBtYC9adGZd07VCQiRtBRUbRI9EAnc5gOt0t9gbQpVL5ctFNm8xkwDM8IDo58ZCYu8bpE56An8jAsdVoLdCQlgQJR9JNwo7ZIYORCdZ865Bczthcl8KDMJICawEDzYOVmC85WDy8OCrEy4Lg3UPBbYNhMsXkBCiESDz8yDL8xCKU4Me4ENmFf4gUAF9lJCM1ak6cCQjBuINBftJwHDRV0d7CvAnBsEh9zEFBgDhDF8M9flGN8l30O1ikV0oUbCYVs13Vux98jgFBHQhwYp1BGk+IcdppApoZtC3lTsSdAjyDgijCmMTCwjh5DdIVtUmUIA2UaR2tWlHVRUDBFCo9DhEEkVvYkE1gtDpUU958AjQCDDiiVVSio15lgVQUJjjdMcHF48HlGQgp5cjlAo5hORjgNBgIHF-CCihijNwCQiqVo1O93hqjdV9UsMiQrYuxLMuR9hCQBVHxGQ5hBYPA3wFgfsgodiRkRCgi1NRjQjjiaDTjUB41E06iFgPUft3YZI1sME7FFoiRvoyQvRlhvjiV9D9jDCASjiJiF1u1v1IUsMftg9bYhwQJMtmZT0CQ0iscMjrQsi0TciA0gdBiL8sSRiI0yj6VA93wsdnUWkwpnQmwuCiRHRB81h+k+i58hDdj2ToMGMSiCI2UQImQmlD8UUhTxM3wSRjh2w5jQYa1mTU8QD5T6M28yp34yhYByBIAE4mM+MDArYThSRJUgIAIOdVjUENjFhvBtjjSBi5TMSFSLTMIsAkgAACLTZECMtwLDBEs4dQ84QccSQGdIw9XFIkW0IwdEnXCdEMg4+AKQrOR2VbU4TfM4bfR4nYcVJwIkX7bQCPG0XM4NTzc09Ge7YkDfaLLfKKXsfYU3XpYVKGPNI06UwQ3Q004Mq1ZrOHLAqXbs8KSsvs3mGwP05gjlb7H6DwFs0ZNlHHMs0KHs5cnfVcx0LeDLDQQSDkf08cnQtzYRfcskQ8isyKU8hXHwY+UkT4lkEVPQQg2bEUZEEDKgBiWo4s1rFKOYH2CcScMSFwdw6YUVWQsSakJsMkMcog-o4hJMKqRgCAbVf0NlQ0xwFwNkN2XnIjXmKKF4ytPYbQS4EwQHfcs4F848t86smwIKGxfQGTEcW0DrcbXwIAA */
  createMachine(
    {
      context: {
        ICEServers: [
          {
            urls: 'stun:stun.l.google.com:19302',
          },
        ] as RTCIceServer[],
        peerConnection: null as RTCPeerConnection,
        channelInstance: null as RTCDataChannel,
        localDescriptor: null as string,
        remoteDescriptor: null as string,
      },
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
                  on: {
                    START_PEER_CONNECTION: {
                      actions: 'setPeerConnection',
                      target: '.services',
                    },
                  },
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

                  initial: 'initializing',
                  states: {
                    initializing: {
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
                          },
                          initial: 'created',
                          states: {
                            created: {
                              on: {
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

        createRTCPeerConnection: (c, invokingEvent) => async (callback: (ev: any) => void, onReceive) => {
          console.log('CREATE2', callback, onReceive);
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
