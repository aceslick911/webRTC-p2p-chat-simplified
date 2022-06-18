import { assign, createMachine } from 'xstate';
import { log, sendParent } from 'xstate/lib/actions';

export const ConnectionMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGED2A7dYDGAXAlhgLICG2AFvlgHT4QA2YAxMgPIBy7AosgCqKgADqlj4CGASAAeiAMwB2ACzVFqgGwBGAAyLNsrfPkAaEAE9EAJgCsADhUBOWYvlWNz2Rs+yAvt5NpMHHF0UgoqMGpsDCw8KihqAHcwACMAJV5kakEwMAAnAJjg2nQxfBJ6fAAvOKYAZS5eAH0ABS4uVMa2Th5eAEkOSWFRYMkZBG1dag17C0V7NSs1Jy0rWRNzcYsbeWprWXt7eUcjxQsNX39ooMIQskoaKMDY9HiktIysnPyr2IxqVAAZgC8shcmASLhIExYGBcABBdCwJK5AAicGwuXwghGSBAQ1KElxYw0ags9imJK0ZNszhcNnWiBmFl2VgsWlkankK00qwuIAK12Id3CkR+BBeiRS6Uy2RBYpuiRIpReADFUPlyCRAvQmBQtVh6L1EbgtdgIhhUNl0IMRATrUTECSNHYrC5NNZHDZVMYzI6NFYrNRXAdnRz5JzZBY+QLfrcwg95RK3tLPnKnkUYbkAG74M2wagA-CMXi5LWwYG5agw9C4I0A1B1Xhw9KNXipOHsWoq9o24Y3UaOxRWclueT6CYWNRqGxWBkIGxaDTUBaeTRDqes85+fnyoXxiKPQpxSXvGVfGMZvI5vORTXayJgiFQvX3jCsK29u0D8aKJzUGfyNM+yyFYv6KHOcw7DONg2NMmgLjYFjyNGu5xvcB6Jq8UofLK3zpgqmbXnABb0KgCT5gAEiIuAsKkXBwrwXCNKwKrdqkn44qAYyGHYNj2Kozokgupzgb6CD7DsChaDBMxeKsaiKCh+F7uhor4Um2FnmmR5-IRubEQCpHkdQyAVGANZMBRrC1E0LFsRx-YOuMOhLqS9iLvIsxKIYEGaLsWwye5BhaFSSk6WhIqHtcGmnqmeHhVWV76fmhlkfmgi5gA1tCsIAK6CMgd4GnCsBwlRsC4A5hJcYgbrUFyagzAoMHhhYFhztYdhzE4gGuoosE2GoYWChFCbqVhsW4ReBFJTeqXGRl2DZTCuD5YV+pgPQJVwrU9AkFmYBVfaNUIPMajUB48jbK4Ghjv19gdbYDg9f6SgDUN27TSpkWYSeKZTahiXZslJFpYqypQGquQIkieQsAAMr0XDsE0Ha1AA6j2uL4px0i1UoF36ApihUgJU5zqsOzwQYRxaI4ajssNsahKpUXPBN-3noDelzUZ+YYuCkIQDDyK6kVm3vuZkBHd+2iRiopxep4g3WOTYkM4GV0BvstgIYzn2oSzP3jX9OFc8p6BA0RsBMDLTluDoy6DbYVKIe1YlkkuQWARYCiLGcChM8ERtjUeMWc9pI1W8ltH0YxzGsVjQi2rjxKcudjUHIsCiTiTokbB4S6yINTiuJGfGnEHNwhxhJvJmbkexkwEAYBEVBZqgmUROQ1EALS5Lg2C92zuM445J1stM1A6CTkarHMGhOHOY7MiS8kGHL0z2FX32h9FHMN-FI1MHkuTqlke24PWuQALbUD3FX94Pw+oXbE9UloQbOPx7LF7MZxzinLIXY0kOTDgOIYNqO9Rq1zDvEWAe0DrUDLMiVI4IICmCYCgvIkBWBAjyG-PGmxpLUEcM4Dc7obBLzEr3XQvEZL+n4ovBYNhoE1zUnAqsiCIgJCVOKSG6p1rajFhtQ0xpTTmnQJacyhDiQcmAdYDQk4dDskQp5OcvdXC8U0P6RYsEgLIQNhbdhI9jwIP2swAWT4RYEOxinceRDtjknDIhRc-o5htTWDQuh-4GHDkUMw2wbDhR73ZjlVaBVxZbVKuVSqdi+zVSISTT+DNTgKCUHTBYSgNGzHOh4f+sF7DbE0JyYJ+4OH73CWtKJ21doWNkYgEmzjnSIX2EhbqGi-5TE5F6NqLsRJlNZmKSAt4IT8LqMjFEjQVS9HhlwBpCBDD1SWHMemBh7C2C8RsacOwyTtMnPI2QPgjHhRMcMiAozcDjLosgLgvQABqTEZlzIWUs8MTgDgcnWZs5eixdgKSUQpLYLhdCDONoUKE1YIBEDgLAEgMAFlbGZJPLkQEPBWB0BBP8sFPJHD4qBV0VCwWhKFiI7URoKoSP+OgG+sL4WHXiV+JyvtkVOCOdBDZqy5zF3OjOYuSjv7uUQr4bcUiIBwEkF9GBtAGAMuTgk46RCFC8rcKcI4zUtALDUHOVcQYSRTl6bYVwOhiWwP3qbLSR9YzFFKOUKocQFmL1usuCMrpIwtPpGJReLhp5hkMCFTy+TTUVPZhauKUr-j4PyI+IWjrgrTyQs6FYswvQKB1doZkY4aa3Q3J5KMJyRpnLrppcNgNeEQyhkIg0jqQLKEOL+YukYOSOHTXMaelIAmgUcKyVhBbmYhLNaG+ulqI08wMkWMAJYywVkSjWOsqAa0rHqnMa6dMZgBK2bVDZUxnBtTVY1ac+bLjGIHSG-hYaAYW2jnNCdU7EQzqhXEFUE7HVAousONqnyVZKOXtu0cSFGpwUAr249pzT2mPDofUds1x3FlLPe2x8qmUnSUbBZdRSXBrtmIvZebUpguHcsXbYCgPDBogwfEd3MYP8yiQ+QW0tGWp0dGSOwXgin6DZNYScEF7BFy7WuUmoEtygcLeB36w7S1XrHTR0R-wPyMYccSIcyhZislAqSQ9JIKYHF2LBBmsxQHzGOSJ-t5TyMXvNglaToztSOvaRSfYVCP5ce1WJAJdhG0AsXFsWw8wyPiZLZeqz1HI0zuwWCCAr6rr-nc6SdQHzPUbFsMioK6KQJqe3n24OYni2TUs1HazgIZ1WNjQpxJacZwOC7ayADixXNJZIU4AFDD2Tsf87liOVrLzAxvEVxDeJ7HlcdAsZQSsVbxZXViwMfs6YzkXKoZw7XOESaCwVkL81KLUVeUUqYIVbr5PDPxercgp5HKcAErk7I+lLfNSt-L1rrMbZMmZGscal3+zHKyQuPJuWnaOXMMCHGPomey2ZgLeXG7detqDBaWVtvkl0GOTyhxBrTB1dF04mrAKkhLmcRSWXq45eW4F+7UOQZPfLfwqGNjcivPDKQiM+hDsrh9Bsdwu2XDFyHAuScN2h0k8hzNHrBk+ahbyDThjSGmOLPp-MZHVClBuFuoAxcF03CdVknBYzO4T1g461BqjwuUqi5K5AGncaSQM4zVyWYhdZxiVZJ-Khk4lAgTO0ovn567uC90ut0XWAEgAAJKWQkDxoONHhdgtKOasKhGLWeIE5OSRCTjkfx+mJ7483uutC+hxt158sGpNSusUtqOql2qBmEU4cSx-sgZ12BvXxOIc5990b15JCi++xL61d2Gw2QqEMBs-Y2htDDl5AT3eg6vcC9b4qseQ2EDTmUF35qpe++IF7konYitqTzcu66TPkHkALKnJ-VfPfSQb4QL3Nkn99jzADHxQaTmj0N9E03815ikHhbQSQDBcaSE-4nIiivG1e4YGizgo2MwM4roZcGy9eUqRanC3+PCfCT6giUSNaSw9U+wzgIUjm9MkBCw-4hwOi66rovsR+8C3CCysByyringXaniGiDMwCzuPagEHy1g1BCyyqy4Og3eGSj+2SNC04vErWHkQ4RwngnuIyeoVyDqZWiqYwvc04y4JI3kZwOirogCfEKg8eugRMnIw4chFyj6qoL6yh34n6-4RytMKw4YC21+04S4AUbs8Ev4vOk+0qI8IyYIZo+AOYlhjAiKZIdhCgQUroxMpwvyn8yibIXmM4Q4ZhCyvcMwGhnIu6Tor0KuHmt0GKbUAUCg+OIOhO5SkIt8VAT4kW1hzK1IAhCk-KBwoCx2p0BMSwSiWwugqqxcwaAISojAEAvAqAF4iK-2F0v4PSi8ni1CBcGRpwQEt010VC2uSBA6aRuqJSWhORuhNC4YS4hgrI3kV00khwIq3gQAA */
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
                            Host: {
                              on: {
                                CREATE_OFFER: {
                                  target: 'waitingForAnswer',
                                },
                              },
                            },
                            Client: {
                              on: {
                                HOST_OFFER: {
                                  target: 'createdAnswer',
                                },
                              },
                            },
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
                            waitingForAnswer: {
                              on: {
                                CLIENT_ANSWER: {
                                  target: 'offerAnswered',
                                },
                              },
                            },
                            offerAnswered: {},
                            createdAnswer: {
                              on: {
                                channelOpened: {
                                  target: 'new state 1',
                                },
                              },
                            },
                            'new state 1': {},
                          },
                        },
                      },
                      always: {
                        actions: 'createRTCChannel',
                        target: '.channel',
                      },
                      on: {
                        CREATE_OFFER: {
                          target: '.offer.created',
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
          on: {
            setupChannelAsAHost: {
              actions: 'createRTCPeerConnection',
              target: '.webRTC.peerConnection',
            },
            setupChannelAsASlave: {
              target: '.slave',
            },
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
