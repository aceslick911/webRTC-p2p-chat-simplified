import { assign, createMachine } from 'xstate';
import { log, sendParent } from 'xstate/lib/actions';

const actions = {
  setPeerConnection: assign({
    peerConnection: (c, e: any) => e.peerConnection,
  }),
};

const services = {
  createOffer: (c, invokingEvent) => async (callback, onReceive) => {
    try {
      console.log('✅ createdOffer');

      const description = await c.peerConnection.createOffer();

      callback('SET_LOCAL_DESCRIPTOR', { localDescriptor: description });

      onReceive((event) => {
        console.log('GOT2', event);
      });
    } catch (err) {
      callback('ERROR', { err });
      throw err;
    }
  },

  createRTCPeerConnection: (c, invokingEvent) =>
    new Promise((resolve, reject) => (callback, onReceive) => {
      try {
        console.log('✅ Created peer connection');
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
};

export const ConnectionMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGED2A7dYDGAXAlhgLICG2AFvlgHT4QA2YAxMgPIBy7AosgCqKgADqlj4CGASAAeiAOwAmAAzV5sgIzyAbAA5NATgCsagMx75AGhABPRAFpNx5WocAWF8YPz5b-QF9flmiYOOLopBRUYNTYGFh4VFDUAO5gAEYASrzI1IJgYABOQXGhtOhi+CT0+ABeCUwAyrwAgpkA+gAKXFzprWycPLwAkhySwqKhkjII2tpq1IayCnqKRvIG2pY2CLZretSKeo6yirN6epoOxv6BsSGEYWSUNDHB8eiJKRlZOXmFt-EYaiwAoAN3w2Dg0XIJGC9Gi+TAJFwkCYGFYuXQoxE5QkSGkiDUx2M1AMxjUahcSnkam0Lj0mwJ6mo6jM2mMM0JhjZ1xARTuxEekWi-wI72SaUy2VyBT5APQQNB4MhFBhWDhqAxqLCcFgJBgWPG90mBJmBmomgMqwMmgpLgMbgZCEJcxZqi0elkDg0Bh5stC4SeURexQS4q+Ut+fvuCvyYIhsGoADN6KgkgnBOCANZMYG4ACugmQ0NhTVgTQAEiJcAacZi8VNFvISbMTG42S5ZOdHezqC4ORS9NpDHaXBdfSL7gGhcG7mLPpKfjKJ4DgbGlQnk6n01mc2B84Xi2rS016vQSCCwDWJvWCeTlJ21GZ5GZjJS6d3tL3+3Sh-b7WOAl5ZcHgiZ4JznCVvmlP5XhKVc40hTc02oStYFweFEVFKBWETRMChYdIuCaXguFaVgADFyO6K8jRvBBOxcZkdBtTxFj0OkLGsRB5DJagTE9WRtFka1BMUTRx1gydBTAySIPDRcYJDFdFXjJMU2Q1D0KSEhynecjUHyJp0FgFJ8hYAAZQYuHYXhWiadh6gAdWovExlrY16OWFRFD7RQxNMQ5NEdOk9mtR9rRtYxjGfCSlJAwNhVkj5IIjJdJOUtdVKQhNNOSHSsP0wpDzAegmBVWFqDRDEaNxUAGzMc1tFYgwfOpWlOK2C05jWLxjE0NYh1feRYv5eLp3A5L5OgqMMoQjd1ITZAqjAdAtPyhJCpwvCzPLVhGjIyiXKEbFrzq293GZM5BKHR8TlkFxu0UOZNDEzRPSu9Y7RGuUpxkkM5IXabgJjOa1K3aglvwFb0OwBEkUgIyTPw+ynO6LgABFWl2xoarrM6nQ0WQ+M8AxZHZAxDkpWRgsceZ9DcO0+pcZwrkAmaxr+2dJsByNgfg9cweQyHoby3SoEKotVRKsrivVdB0RW3GPPJKKVCilw-PJCljDJx0upUTweP69ZKeGtngN+oMJrDHm0rikGBeyqEkSwpN8EYXh8hhWBtuoXAveM7b0jAABHPM4FwJgEQAKxCSAlbownlA9Wl2J1pr5A2LjplJeYX00HxPRcb7-Wkq2kptqDefS+V+ayhbndwV3E3dsBPe933-Y7gpg7DiOmDICFBFwdvA4KBP8bUO7qHTw4jD7JqDEdLWm0cRR1C8YTFEcH1zZry3Ev+7mq7t0aHfr8GVSb0MW49gOfYKBV0AgDbW6YCAMCiKgQVQTMonZg+M43jH1SopM+ddEINyvs3Vuo8H75Cfi-PSrcEDf1QNgJE9wADaigAC6E98TTFmMyTOlohKjgtKSZe7hNAqDZOsXQfZRw+RLlJUC5cj6V1Aezc+kDL7QmvmKW+bd76+2BM-V+jAmAFHyAZHIZ5cCJgMgAWwhhbMuh8uZcIUjwiB81+EuxvrA0Rj9xFIPFigtBGDQg4Pwa5E6tF8Zkz2D5ZwfkDieDUNQvqdC+rkOZnoCku8bj7w0UA1284T5gLlLw-RyFoFGLvt3BBGZsCZnIrA1A9QVoQF3M-OBQdQ7hzQgQqYtJaGHHUNodxiwp70mzlPT0fE+qODpOyfqQlWECnYZo4B2igY11iYLBMCShHGOSdQdAqACn4TMRkxgpTEBDmUH47wZMNAeKXtnQwtCGZPUztdFYXSOYcK0ZE7hfMVJ8PiQImBSSx4IKmTMsy0FskSOQQs+xhpaqEKntoJsGg6QWm3h6R8D1tnWl7O4QcWsPCeD0McwB1tzk6MuZla5IzbmJJERM7SYteBZNwCQfIkdeDpBRlRHojQWj8C+e5RO69aEmHtI+ISTVmZBQad4M0loPSkM+qScSe84pIoriigZ9s9HDMbncnFDzRZYQJU0bAQ9I7UraGSilR0QBuVOoQpqRMVZ+TdMsAJy9qS0NJOyFYpI-KjlZiEkVYTkUpVRYMqVTtRmJGEc86gCIIT4DBB85gH8aBoL-mo0JPTwmhnFdXSVVy4mYsMWM+58C-U4DAIGyRYBUHoB-tY7BeDFkEw9OaDwKwdA+HZMYbxtDM5+PugEtQwSgJRoSjGgGUTdGJulV6t2abfb+qzUGixUiZFyMEAopR+RVEAOdWK11ErwG9s9Vi1Ncr03DuzcGvNBbMEYFsSWqeGtqC0j-KyNwFJOVbG1vWtkOgm2PiCYihdnC42nxiR6qB66oAWT2qRPo3A+DDHYMe6FzI+xGHYv+ZY1Ns7HEYkYRDnZ7TPncK+6NLqprxpXeipN79P5AiJciSNTqsOLpw5+uCq6FrHouN1a0IKnpkiMDepZxDXyzC3mSJQ-VMMduw7baJoRCNhvzb-KI5Aqy2BJdgWwMafm6scYQ6klpmQeEEpnBwgT2MIBek2QcbIaReALkKx1o1RXvqXbhuU0j8iyJSdOlR1BpNoVk7geTim8Y6ocT8qYamiY8XOKYDQOsGaOk8BUwkAlCQ6EMKzQCUyIBwEkPOnpdBPnHW+T5qYpNDWHCpGsG0FxwVbHsD4i4ZNRyWjC-x4Vlm31nJs9R6MVByiVBqAkEtOhiT2lpO4Y4g59mOh2KOPiRqzisgcFoAT41KPCZ7fh52FVYaYXjnSvVUxnRmlUBTUkgTDArCzlsJq+x6EtRML+M4xcGs-Sa30j9InoxSvKmqSq1VNsqe24Es0ZhwrVJWMJTwjozsnA8OyYcqHvBzc5o9lrz3ZoCzeyVejnYSRkgpFSGk75s62B7GyNkXhBz9U9KoWHpz4dUcR7XWj4NUmZhLYOPYUHnzUjMPaQS3Y5iDgCYD61zhtAU96REhHS3QZO1ymtzB7wtrjy+-5uQtINMvR-M+FqPFl42jPZvbwT115TzNhZ+7FHrPU-F47BuuU8UFQMojUyJb3q9kMDFt0V34NbHV3xRQqgdadjJLMB1bbyOCYW92tFEurdVgVRtAyktYSO4tL2C0ambQrHOCdxAlokMtvhf+C4RhhedpAW6hNy3JdVkd8zZPniwrp50KDz8TUTBvTMAobwdIi9CfD+6unQtlqrRj3pAycv8jHvJETBLbht7HFpOoR0XhGKXGEjrNYzNnxB-S6Hs3i2I+W-BsLQf0vkQQHt-L7L9LJ7kj2CYGL28fyrG7NrykpgA9KGg13sPFze-l4boftaYsEsss4+Yk+wJgZIoWwk70kW9oJIue5MhwkOt2xupcpuzW5ue+F8-eUMq0x6JwTYLGEBgSUB+gy8Rg5o-UpgRcj4bon+O+PeZekeBigi3q4y8qXcDyvcxS1YCuuWBIYkjEPuL01oGsBcRmy8PkjExwBulalCRuwejWaBVOu+P+TBNyKarBg6piOSOaJa56OupgquJMHY9St6jgLiPuc81opgHY8hW+829B3+jB++6hLBA6m6vsDO8ybcWSOSehHYKghgByQ4tIYkph-BU8M8901WhIQ4CwdB6BKhzhWByabhPqJijy0yGRTOZ2ugywdqoKwk4R0wARC8doPu-4ugCRyhDBeGahqRsqvqNuCQBK9QRKJKeBxwfEgkpgJwGyhIZWt4TIzCFIT0lIIkra9hcOouGBqhLhDR2KTR607wSqKqYAw8-hTYlo1o7EM+zOemKsPKb0JwngZIHoCg1RMxSRdR8xMqixGRGaAao63heBkK0ROs5wZgBcUUy85h+wlhcKOmthlxsaYumBGKdxG6zyjuLa+wHK7iQRXiCG90cBG8QhwktIm+6iShVxtRX6feCx7wPWgScJbifkiJjoxwcwf48WlBmsagIJXaThNxKRbsZQsA5AkAksLB4Gp6Lai80Ug4FMgSoOpRMw5Ra+zEjJJey6+Jv+W4PWb0pJL05Jnio2p6g46g7gzg90Bc9o0p-StmNG+GPWF0riKpHi1Io2Ks8wn0ZwawHiPusgBpT27MPWj4ypCJapeOohechWLMLao4CKd2qB2+iRWQJa+2npqpVpPp6OHo687ibIfUNI5mChJuYZwCkZTI5pXpsZ5WlohmlIJ6XoTGwZKBbCCUyIs6VA8MEAJaXg6mHK5wBcJgfkme+mg4YBEBNIiwEBwuiYOkjAEABKfoDZRs-xmcnxJho4wU3gNetq0Ur4lBaZUxl4vBHknO0ZlpSJ5WQ25augnopIyZgk-g-gQAA */
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
                                  on: {
                                    CREATE_OFFER: {
                                      actions: 'createOffer',
                                      target: 'waitingForAnswer',
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
      actions,
      services,
    },
  );
