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
      const description = await c.peerConnection.createOffer();

      onReceive((event) => {
        console.log('GOT2', event);
      });
      console.log('✅ createdOffer', { description });
      callback('SET_LOCAL_DESCRIPTOR', { localDescriptor: description });
      return description;
    } catch (err) {
      callback('ERROR', { err });
      throw err;
    }
  },

  createRTCPeerConnection: (c, invokingEvent) =>
    new Promise((resolve, reject) => (callback, onReceive) => {
      try {
        const peerConnection = new RTCPeerConnection({
          iceServers: c.ICEServers,
        });
        callback('SET_PEER_CONNECTION', { peerConnection });
        console.log('✅ Created peer connection', { peerConnection });

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
  /** @xstate-layout N4IgpgJg5mDOIC5QGED2A7dYDGAXAlhgLICG2AFvlgHT4QA2YAxMgPIBy7AosgCqKgADqlj4CGASAAeiAOwAmAAzV5sgIzyAbAA5NATgCsagMx75AGhABPRAFpNx5WocAWF8YPz5b-QF9flmiYOOLopBRUYNTYGFh4VFDUAO5gAEYASrzI1IJgYABOQXGhtOhi+CT0+ABeCUwAyrwAgpkA+gAKXFzprWycPLwAkhySwqKhkjIImmrKLoou8gYKBobahpY2CLbGStSzLgbaBooKmpryxv6BsSGEYWSUNDHB8eiJKRlZOXmFt-EYaiwAoAN3w2Dg0XIJGC9Gi+TAJFwkCYGFYuXQoxE5QkSGkiDUskUxmoBmMajUi0U8jU2hcek2BPU1HUZm0xm02kJayuARARTuxEekWi-wI72SaUy2VyBQFAPQQNB4MhFBhWDhqAxqLCcFgJBgWPG90mBM5BmomgMRiWMzcBjcjIQhLULLUZjOelkDg0Bmu-LF93CTyiL2KCUlXxlv3lJWB+TBENg1AAZvRUElk4JwQBrJjA3AAV0EyGhsKasCaAAkRLgjTjMXiprIFKSuRSrdpibJtBZrHZCSpTno9JSjg79JoXP7Y0Hhc9AxLPtKfnLA4D44nIWmM1nc-mwEWS2WNRWmvV6CQQWB6xMmwSKcpZGZFIo1NbltoFE7bIOlM-R0OY4XEnac+VnIUIgXV5xQ+KVvllP4YPuJUExVZMd0zaga1gXB4URWDWBTFMCiYCAMCiKgQVQHNQwRJEwFsVBiIKW8TXvBAexcahTFmeQ9E0HtiSMJ1LldExvR0PRX27PQZ3XB4oNDRc4KjVckPDDdlSTVN0ywnC8OwejCJY-IGi4XhWgAGVYZAmis1oABEuHqZB0kGdpeFYdI2NxUAphcWQLWORRPHfE4FEWFwnRMeQeMCtxpOkpZrTAm5kMgkNRWQpd4OjNcMsVTd0N03dsNrZISHKd4ADFUHyJp0FgFIzOQKzBi4dhLKadh6gAdW6XzG38uRpKHFwu0UBwR2MTQnXpPRSRmQxzhMXY5PAhTgxFMM7lytTEIgortO3PTkwMyrqqgOrChPMB6CYNVYWoNEMSG01OLMS1jlUE5FlpRYnStV0li8WalnWYxFnkwrtug8N9pXQ6FNQrcMLO6hkCqMB0DwpIqtgm6iJIsyq1YRpWlYGqasGvExgbD6KXcFkRx7dZ3UUL9ov7BBHFdTQpsE-QvSOQ4Yc0xSst2t5VKRmMUeKnTMOTLH8BxwzjMgRrmtInr+u6LhHNaMnGnejiKVUfZPGWDlVih1R5scagBL0NxDlmlxnF5dKJbh5SctlhD5cK1GSuVzHsdxy7Cfq0t1Xux67s1dB0Rxs2RudNaVGMKHXwpSljFkYwgaMFRPEuC4jj0e3xcFSWdpUyM5YKiXQ6VjG1VwWDU3wRheHyGFYBJ6hcAHpqSfSMAAEdCzgXAmARAArEJIHT-FnVUZQvTpV3C5+7QnWOEkRwrnxvTSgNYfnf2EcD-KNLrtvTrKzvu5TXuwH7wfh9H7+Cknmec8mBkAhIIXAX9x6sTptiO8GdZhfh4j2auRgJrHAMDFC2PFXzqC8EFYkoVa4Kj9tlW+Tcg4t0forZ+WFX4Rnfn3MeQ8ChKnQBABINUP5kQoqUaitFMZbWviQvad91JHSfujF+0Iu50I-hAph+QWFsNqh-BAVFUDYCRPcAA2ooAAumvKYnJXQKDQVzc41pi48wLpoFQ7Iji6AmiBBYhDQjEOlt3Zc5CH4KnEaVGhUi36yMYcPYErD2GcIKPkeqORLy4BTPVAAtvwq+SkhEyzIffMRVCJH+KRIEhhf8FGhKUddFRaiNGhB0fo6Bxo-LryLotBYzgZKGBpDFdwNj5Dsh0LINw7oxwuLnKk9xEZPGZIVidHJyZaESnoZ-YJzDszYBzBwvuqB6g4wgAeVhciJ7T1nrhAxiA6Q2OruoSapx1CKAZFY04NiTAOAWNXXQXTZCDMyg3AOGTRETLQu3SReSZEFMgQo9AqBdmkWKasm8NSGYcXWMoWavZArkiUIYdBPMVrUDdm+V5nICGbRSVLRuYyfkh2yX46ZASgXzMKdQMFEKzKIQ2WE5RjAjnOk5nFDQ9IrTEi9O6bmWwsVuFMO2Ew1p+LvPrvDYR3zkbksmZSqEgLZlBLpfjK6vB1m4BIPkeevB0h6xpj0RoLR+CwtgevWY3p9geE9noL8wFnAxW8Baa0XounWjpGSTQ0q3EkrymS1uFLw4zMSHMxl0cEjaqaNgUB88zVtENca2mQgYHsQzscWQ+wTCvlUPxJpNytgaGcKSHOXYLGvhAt7S+vtBEjMRl4rJSqw3UrVcC+R1AEQQnwGCNlzByI0DUXwo6AavmkoVSG1tHd20RvVSC7tOAwB9vCYwVR6BqIVO0XojlFIvSWg8KFHQPgOSWJLR02xSLekOvfP6htgaDrB2nX86hVLVXzs7cPHtK7+2lMYEwSJ0TBCxPifkJJY6H0TqDVOyhM6AXSI7bSxdP7V0Do3VuzRGAql7oWMoH1hw2R9JAu02aV6el9MAn6Ql9bhmPubt4uM8HcmIagCwGy9QuC9A4NwPgwx2B7vcItXpxxBUTmkrIJ0RJuJGGk8+B0-F3D3ro9Bp9FCfGhrOlwmguEGLJNo8S1TDGW2vqmXu1aZcBamDfOSIwc0eZGPilyPBqKpryGU4Z0hk7n11205RTdNEojkFrLYfV2BbAjLqfTK1UwaTWhZB4HsXTpoup5gLOKjr2S0i8FOP1NG67jq8zBnzCpAP5CiQokDSIwNJOC7hULuBwuReGiAaLmb15xZzZcASvFLg3qFYgTwpzCTenUN6dYZJ-B8jBRAOAkhIOpLoOyy17WpjLBze6XY1JbTOCnD+BwNjzhFxAtaDQ4MPOfKK2pxjKEqDlEqDUBIHLPZPh+stCangpo-kcBtrwXIDACzs6FajPsCtQau8Z35aMVXPSMgRVeK26lTBdBaX6hheKGFCgfBzFpOYeBOCYCbI4L4Lc83K7z6mmOmZhxqF6b1EcteR6OC0Zh3RHFfMsSVh9cd2I5IYQKrSScCJUxD5tUOSpPQ1OZ585amZKBpDvb72hqDsm6ZSAWhgzB5dB0Q8H5PiuU5QppsqSycwcpHMrlshgTACUpLoNQ+24oAS0Ads77MLuyvSRTm7WlqfhwunDzR7xiZQPTbUxnch3QsnpNcxYQVVDfluYinQ-FpLUkFRcD3N99fXZM9D-3FVNUxwak1FqHLvSLXpEYLs74grPj7FsHOcUU8zDi5cVYgUs9pI8Qbn3x0-cYwukX9hsck7l6tNiq0cWZihQEtjrYqVSThX4hOcxagu+NpEbBjTzHzq1me6XEKYVrSnG8N4USObTCTjzssTmnsN-0bF4qgfZVVbq2jbVeqIf8h7opDm9Hbg3Yd+6gok3gh6hcZIKwns-EtapOl2OekOz++eGMb+UcgeyIEA2sZeDOjM+6dqI2xI9IomDeiAs0roiwpg5IvYoU7oD+RmT+L6yBr+kceMBMI+t08c9Av+U01ANm5IvEde+gToi+RgFixw1cfOQuRK8BXuveeeYcKBLBuGvYvBa0NuhIywQhVipc5w3glIRc6wWgby+WuuIuCBDBcGL+LG+SyGXav8IKACBydYOB5sU03E1IgOU4bhmWMUCw3ERIpwswAOVongdBou4ySBChCGNhUaxSa6MKYecKWahwKu3WAshwSwAuMUjgjS1IyCAOpggU7mJhrieushue4u-y1hNKUapu0K2qLKEAHKdIXWrSTqjq8wWhJab4iKvSx2hI6whgxhOupRZh5RiBjBUR1RSGUaDKCyP+LhGcjqwU+gMk9IY2qwh8gU2KnIhw1IE4ugYR5hERkxVR76rGPcX6zCw+7wDRuq+quGRI+wPY1mXISghIA2mczITilIb4iwAOQURx4xFhO+Vh5xMR8xH+UAsa8aYAYCzRiwpI1o+g8whcjqAkGCHgS0RIP05IXoCgQJPeFRkRZxKqFxkakJqGf60KuGAO0eRcz4+gWg7g56BIORvBeR+O00RRhJoychlRb6ZJEJhS5e74vBnsAsr4rSDuPMLYMmhIoUhwy0DoUhBmMhRJExlhTB0xUAHK+groTSkp1yYUUmb4pISp9iTJf2vJTaJxWpUxGEd2sA5AkAccrGgm8wVsaC604ho4WxOaqCexmROg2udaYOYxGpIJVO2pyYWASQAABLpsiPGWoLhliZchyGcP+IXEDLkcevikSBoFNDaVviVtGQ6c9pbEfnFhFGfp8b+FiS2FNLZu6KrjnCWfKmWUbpMs9sSCricMfrWVFD+EoJbg6gJIJHSIXC2B2d7kdBymif2aFDWafsOTzLYCBMrj0d0l+JOYBLOXlAufFtWeFKuefuuQ6FvL2HFqWvaMUSMUMmTjLAueSEuYOWefWTMMfGSHbLNDPhoF3siOBlQAxE0YsR1ilNis4BOZ7I4JzLmVuSYEhV+EXCYF3imFVIwBANqrGBymDDYvmusCic+CRjzFFJPlWrsFDBcLNFnguacG+SuZFOeVsLYESItA4LoDoJzAJCBBtP4EAA */
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
                                    SET_LOCAL_DESCRIPTOR: {},
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
      actions,
      services,
    },
  );
