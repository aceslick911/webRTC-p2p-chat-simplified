import { assign, createMachine } from 'xstate';
import { log, sendParent } from 'xstate/lib/actions';

export const ConnectionMachine =
  /** @xstate-layout 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-F9CGAIRuASg6ZrDtMeWhG1d+lxBbla+tpscFKB-pGDkjhs1zAUZSbmX1HCshsCW4F4i3ZbwgTvKBmUixgBLGWCsaUax1lQNelY9TB5aoOLMBmU8P6jjZqccM8ww3itXkek5o7T0pV3vpUD4HESQZlRe0D9bhVvWHE0z0pJ-5ocDBh7D0xOTOh-bFMtRGq4keAwWcjpZKO3N7vcnWMj-4wQQ9sJDMxuY4uRWzKYLhDX+S45oXjHTj0Ce3peZGN4XwGgKk+GdLqKaOicEuFYTIoKGG2O2-6OwZxLHflzRY1gdN4fib+-jS1BOQLWoRUzVl-gfisxI4kcwdjTB0F1GcVSQLiSpns-QttrZ33kLpkBC0zHEZC8ZsLV7osPJs42+zbNHN7L2XOAR-oKRzHGqPKcY4qQ81oUCvjI6guGbwqF-ME68jpJxvkyzknXW6xJHsv8j9STqE5S5xAthVUdT0R9T6BjAHkoIwVk9wWgNDcxpB4OFm6MzgcB+1kMlM1ZqClquwThBU2HftofYpq-PtPy4ww7A3VoleG1jOjX15vOkW+8lrc4qlvRcAFb1Wz-R5eOQdgzgGjPe1RkZci2AKJIta8uawS89npyXSp4c-FbAgU6kOT0swUcgr++jlhpGfZowxudoqhTchItJIGbYU5FxjlNhFOcWxLYEMWJQiJQ5SW7YlQFvr7sMeDaB9jnKHE5YDOxkdXn5XpO8W0MuVZ-9mnkIsDDmSCjnDgW+sDahuXvtHKZ8ef7qvAdY7rujLXI3de40m5IqT34WPLg6vsASLb-mZ3GizUe9MxxLwmozv9YCx1CZO97raSLqcm9dGbjL8xLdBTOENNkpxP1s08E5lPgWVes+E97-2gdtcXvVDzpF7lySdR+hyGCw5VADW5lMLqw4g3shkuDWvyuAMN8z77Zvssueh3G-rqb1m3L+V2P2zLrIlArEzgYTyIEuYziIacZw0-9P9Y96lRvC+G7bV2m3jUozO-OCmIGvYMk5ErYQBuN6LYUkN7acAdHbbrPbJXa-evUWefNGRfHuIPabGRGYSXL-VYH-RcP-Sce+XxFRZYA4AFBXfDKAwjG-OfdXb3alF4AnHNcaTkfdQVaYP-DNIMd1aYMGPZN7BnZ3c1aA2fWAyg32QsEoWAcgSAEmIqAnUeKYYnJwCXfOdRIKQ4JcJkUkJLQhTwK-MgmA6ue-bKHPUkPPemXZcaIvBrBmXYIVVYffLYGYL0bQtHcgwQ72HPMaYwgvMw0kBrN7BRHyCaWwBPPZRw5nZwvmHPNwDw0wi3Brd1dqGYRYGcMnYCEIt3Udc5CIPJXILJEgAmJFeZcpF5KpVZd5cSAJfiPZKcAhfQNkcAodUgpwlMDI1vVUQZMrdfGLOZJ5MMSpFZV0UojtAMZkJQQeGSL0HlRQVI-9M5VJZ1DoirBAUpWYZ5Xot5WpIKARcMXYMkOnb+WYdyKYsBfI1QZ7JZYo-o9YjYARfQOwb+LqSMM-V0A9IxBoxhaRR6ToxY-+LQNLcCTyWSUeP+V0L6Q444gSFY15Eoy4uZMaVQ02awI4Ew4GEIqlbuKQg3b8ARacZcWbH5J0f0NdXFckIcAwd5cGTkYcFEiAKDCAGjBNDEt1MkP8CaQhFYcMVQU4MCOTLYbgycZ0b6ScKk6gMEM0fAHMVUWjBk3WJpZkhQDbV0O3TkvlLVAVVOQVUeY1Kk-ImYHEzkPEzQAksCGQjwL+ECXVfQSY3ghJSEJxKgC7KUnxakZccGe3fRCJB7DYQ4ZQJYf+LYXQCSMaRnAEJURgCAImC8ZVCaCCb6O+BmNmKMgaHUvOXBOrbFeXCAxXVCY45mHoyEi4lTUpMHDqTNQSAdOYUlXwIAA */
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
                  initial: 'initializing',
                  states: {
                    initializing: {
                      on: {
                        SET_PEER_CONNECTION: {
                          actions: 'setPeerConnection',
                          target: 'services',
                        },
                      },
                    },
                    offerCreated: {
                      on: {
                        setAnswerDescription: {
                          target: 'waitingForChannel',
                        },
                      },
                    },
                    waitingForChannel: {
                      on: {
                        'channelInstance.onopen': {},
                      },
                    },
                    services: {
                      type: 'parallel',
                      states: {
                        fileTransfer: {
                          initial: 'sentInfo',
                          states: {
                            sentInfo: {
                              on: {
                                START_TRANSFER: {
                                  target: 'sendingFile',
                                },
                              },
                            },
                            sendingFile: {
                              invoke: {
                                src: 'sendFile',
                              },
                            },
                          },
                        },
                        channel: {
                          initial: 'created',
                          states: {
                            created: {
                              on: {
                                'channel.onOpen': {
                                  target: 'open',
                                },
                              },
                            },
                            open: {},
                          },
                        },
                        offer: {
                          initial: 'created',
                          states: {
                            answered: {},
                            created: {},
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
                                    CREATE_OFFER: {
                                      target: 'waitingForAnswer',
                                    },
                                  },
                                },
                                waitingForAnswer: {
                                  on: {
                                    CLIENT_ANSWER: {
                                      target: 'offerAnswered',
                                    },
                                  },
                                },
                                offerAnswered: {
                                  type: 'final',
                                  on: {
                                    readyToChat: {
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
                                    channelOpened: {
                                      target: 'waitingForChannel',
                                    },
                                  },
                                },
                                waitingForChannel: {
                                  on: {
                                    readyToChat: {
                                      target:
                                        '#ConnectionMachine.connecting.webRTC.peerConnection.services.flows.chatting',
                                    },
                                  },
                                },
                              },
                            },
                            chatting: {
                              on: {
                                CLOSE_CONNECTION: {
                                  target: 'finishedChatting',
                                },
                                CONNECTION_DROPPED: {
                                  target: 'finishedChatting',
                                },
                              },
                            },
                            finishedChatting: {
                              type: 'final',
                            },
                          },
                        },
                      },
                    },
                  },
                },
                slave: {
                  states: {
                    answerReady: {
                      on: {
                        answeredOffer: {
                          target: 'waitingForChannel',
                        },
                      },
                    },
                    waitingForChannel: {
                      on: {
                        'channelInstance.onopen': {},
                      },
                    },
                  },
                  on: {
                    createAnswer: {
                      target: '.answerReady',
                    },
                  },
                },
              },
            },
            on: {},
          },
        },
        connected: {
          initial: 'chatting',
          states: {
            chatting: {
              on: {
                SEND_FILE: {
                  target: 'sendingFile',
                },
                RECEIVE_FILE: {
                  target: 'receivingFile',
                },
              },
            },
            sendingFile: {},
            receivingFile: {},
          },
          on: {
            sendMessage: {},
            'channelInstance.onmessage': {},
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
      },

      services: {
        createRTCPeerConnection: (c, invokingEvent) =>
          new Promise((resolve, reject) => (callback, onReceive) => {
            try {
              const peerConnection = new RTCPeerConnection({
                iceServers: c.ICEServers,
              });
              callback('SET_PEER_CONNECTION', { peerConnection });

              onReceive((event) => {
                console.log('GOT', event);
              });
            } catch (err) {
              callback('ERROR', { err });
              reject(err);
            }
          }),
      },
    },
  );
