import { assign, createMachine } from 'xstate';
import { log, sendParent } from 'xstate/lib/actions';

export const ConnectionMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QGED2A7dYDGAXAlhgLICG2AFvlgHT4QA2YAxMgPIBy7AosgCqKgADqlj4CGASAAeiAMwB2ACzVFqgGwBGAAyLNsrfPkAaEAE9EAJgCsADhUBOWYvlWNz2Rs+yAvt5NpMHHF0UgoqMGpsDCw8KihqAHcwACMAJV5kakEwMAAnAJjg2nQxfBJ6fAAvOKYAZV4AQXSAfQAFLi5U5rZOHl4ASQ5JYVFgyRkEG31qewtZGw17N3tZxZNzBABaOY1qeQULNS1rNUUtLQ01X39ooMIQskoaKMDY9HiktIysnPzb2Iw1FgeQAbvhsHBIuQSIF6JFcmASLhIEwKDCsHCMKxsuhhiJShIkNJEJcrLJqLI1PpKWT7PJZjZ1iT7FZqEclPYqbNaadriACndiI9wpF-gR3okUulMtk8gKAeggaDwZCAGb0VAJWBZcEAayYwNwAFdBMhobCGrAGgAJES4PGje7jRDyCy7KzOCwWRS2N2KWRWJkINSsmz+7lWMmeDRWex8+XBUJPCIvQpxSVfGW-BP3JW5MEQ7XqzXawR6g1gY2m80Yy0NWr0EggsAOgm4okTbSxva2C76L1aGxDoMh6hh2QRqOeWPxsX3JMi1N3CWfaU-OVzwHA-MqosarXUW2wXDwxHiqCsVWqvIsVJcBq8LjNVgAMRfnVbYw7Lv9eyc8i0Ml5DUPQNCDaw7EURxFBsRwLC0Jw1HkWdXkTYVnjnFcpW+WU-lQ3NtwLNV921I8TwSEhSneF9UFyBp0FgJJchYAAZfouHYXhmgadhagAdQ-IkRjbZ0EH2exqA0ADYIMeY1CDKxDhmKTgPkKS1FgskULTIUwgw-CsMzdc8J0xVCN3ahiwPMjEko88aPyGswHoVEnMxdBsTAdshHxL9QAmJRdhDDQaTcQcYIsEd5DsI4bB0DSvSsc4fD8flNwePSU0wj5sKzDd8K3ZVC0skjqGQCovPIuy4gcy9r2Y61WHqZ830EnzHUJfySS0WY9hDGx6QuQxXCDWQLDsTlvQGqxNBjLQrlSnNdOTUUDJyozcKWsyiuIksyoq9AT2wBEkUgejGJvHj+M6LgABFmka+pPydb8EG0YDJI0GwQInXt5sUIMfTsMbFMjHqVhsb1tMFDKVqXN51rXTb0rzIi9z28r8Eq2yqKgByzXRZzXMJ9zPO8kBhL84k3sHCxJJWKDjm0ZnIrMRAkJiwd4sh6xkuhhUF30tNDKR7MUfM4qrO1NFcHPSz8EYXhchhWB6uoXBlYY+rUjAABHI04FwJgEQAKyCSBns66mNDdCT7FUWxVEMRZWY2IddicBYXAQm35v5tDMtW4XEZwsWCu2ndJdKmW5dVBWwCVlW1Y1pO8h1-XDaYMgIUEXBE61vJLfJzsELUCkfWORTnFcb6gy8CSQxDL0phsWMQP9+d0KytaM1F-LTNRiypahJFY-j-PVbyJV0AgGr46YCAMAiKgQVQXUIi2wXu+D3vQ-7mHB6jvaY-TOPFc1yfcmn2fqPjhAV9QbAkXuABtLQAF0i9EqYtDZe3TiHD6Dwsw666HJFyCcqx4KHCsB3Zai5sq7zyiZA+EtdoHhPhKM+CcL5q2BDPOejAmB5FyLRLIjZcCqlogAWzKulLeQdlwh2QVtQ+6DpbQllqfceuCp74JvnjO+D8n7BDfp-ISvkXpdWDEOag5xgL2AuI4AaE5QFUjZBOKCcVAIwT9otehXdGEIyQcZVhaD0YYM4WPc+qcr5lmwLqF849UC1C8hACsM8J7az1gbY8X9Xr0lZIosaAFtBUg5HXbQ5IoJuhjElW2ME4GwwQT3Vce8UEKjYRYjho9uE2ILlfdAqAvE3n4U4xg-jpFTAkrIJwtTAoGFjADNmCB7BTD2BDOYqg5hqQ0Ekhh8M5ZpJYeLHa2SR5cKwTw2x1AiklOYrhVxBDb4VIkR1Yu3UPByKWIBVw8x9lgRaW08k9I6RLCQr0pY-TDGDPTMM0xozI7sImdYnBMyKK414C43AJBchG14KkK674uj1CaPwNZIlXraGsJJC4SUViGHgmSOuFhXTKUjBOG28FFjIX0eHAZiD7nI3Dlkkqx8rF5LeQUnG54vkNGwDnI2oKWgAqBW1CmkirYTDimXAwiiGSooArYFFv4hyckuD1SkNtFDXMDrckW6SzFjLJZY3JUz8mX2oAiCE+AwQrOYIvGgD9150PxTcwluUHkkvMSqnJkz4jYPmVqnAYBdWELAPfdAq8RGvw-pU62bgy5HE8Loe2tTjiuxJGAjR9s2nnA9AsWVcMLUbTDgPG1w9MEOumdS7Vrq9WCKISQshggKFUNyLQze5rUmWuJem5VmaKXqqpZqvNbr9Weu9c-DAYj-UTDaRJBYMYoL7IMGGNR4DNFxp0TypNKSd5ErTaght0cm1QFYk1J8PRuB8EGOwPtJJ5h2DUroHqGKAy6CDPsXYA1xq2FcNFI4KUbhmrlSmvuGSigZpIgvJeQIfnIlNaZAlNbU370yd+ksB63ogV2CcBCiiQoxkuEGd25cvZJQ8PBNQFg51CyYSYutMNf1Gq9WvCI5A7SbD+dgTYtyraUykdTN0kY-xWGiuNLkKGWlHDpm0qYX0vSnAWi+4D1aF21qXQqYhuRSF2LLTQ6glHjzUdwLR+j5NGNcssDGeQ1A5ickxT01QzSNiKTLksQwSF1KaWfWlV9ybQNrlgI2Zs1AVZMR1iQCApgs4MSYpAOqhcIVUwmJsM4v9KShP9GSdjYDUN7EUF9MMroLB0jigGPD28CP3Jc02CIHz7K0QJrCYmsJ+gMR+egCE1AMCoBxNB8L5wKRIQuDFgMSgqQJcCoA1L6WEKwLxWJt9Tnvh5ebKiE6yJzpMUaxFlr0WAwdfiy049SXeten65lobMMQOFEgC8motQOL3RfP0FiXBoPaF-ksGSqKnCJQuCK8krdUWt30PsdjWWjHIggId94TA7zIC4P0AAak+M7F2rvNdu4o+7ihHuHI2EhumkMktqH5XSR933Bkon4UQOAsASAwGg+NOm2LQmOA8ElUziB-TKC9qigdHp2NTBx2KFEaJyuVZhDVjA1DCfE5bCFpjEw5jk7qfMWwLIoL2FGt9McZIFjelObTXwqUikQDgJIKtgc6CrPapC6RCgy4LG6fSBQPKZqRLLq4ECGkEf3u0DKnbAtxM5ck+BooVBSjlCqHEaDVI6auCAfMcKwUgzbC+j2D0DM0tpbUrh13AdHMSbA5+giyqucYlPKdCAV2QLKG9PBVQFwFgY+MC0zwdNwyUgMJXQ4Bh2ejZGdarPblasNZF9pmDaKXCeAuONeaLtwKQzZJDY4PUcOBVxaJ3b7vjGLq95np5OTYQF7Sy16kIYJz0nGpHzwKhIZJRtlLn04Zm9p4-Uq1ftWrxTw83kC23eNlvUfWyJC6OW4uC6y02wN61InAlgZoWQZpL8Pd08b80Y781Zjozxn9DdQsSQLcKQ3QdBJpzgqQkdEAko9NZhDBQpvQMdVBwDF9PcM9Cpb9UB79cgrtgI6YQJAoNJ5gf9ZBAYnAZgZpfonBfYxo7NddU8IDr9HloDh57FdRoNlEVA9keYlhYlGQ-8akItBwZp9gOZdBSChlyCoCh5SobI4Dn53ggtaCX9RJ9gTkmZIFxpLhf9kdYJJJooyQfQlBUUqQXc583cRsr9FURDdC9obJCsapaIZtgtEDRcXRo9dAbYkIFAuZDhRovRpDW4YIAxP8lBNC7ltDfCj5rI7QaUgjHISZoMT0VAPB9B2MepG8FCzMFgxxACzgB8dgk8PCU950hCfC29b9h4yJA9FFSiQpAIAJZhYobd9MDBFgnAEILg2sMiFVW960ujSpMZsZAjqJaJjDocQJlIWR9BQ1XBBxwJXAZhNJThxpYJBp3D7NhtBCyDIDsjnlljDpc9fsQiTCwie8wk7AepH0dAYJXBAwWkj09h6QXD5gzhW4+lk9O4vD2j5jl1FiMYDoqpcZ8Y3JocPQZh6QzgGicNwSFJaiBoQooIYwMdIwRMrj58YTbjhDOjRClikTodpgzlsSLhcSDiq96Q5FBNaYdEqdmiKTPCbitC7jaS-DVV7V5YNVk5eFch05fF7RTCoVB8ZhVhdAko7d4iq8DA6ZAIm4vALhBNZjmErUFi6TyU1Vs0pS+E3F3Vij7YOl41dkbZPBqjD1KQKRbBOsbZ+9akjTCMpMv0V1zSJTHUZSdQHFykE4XE3E7Sy5DgQpDAEV69XSaYFA-wdFnBHccM-Sl8KCI4zTxTXknU5kZTJCOCph4VAIWRqkUyBoGdulYpBNFJISWjoShTMiRTTSxS7UiywzVioAvlagfk-lodFhJITM4odkNIQpIk2kxwYwWR689AFAcysjRSciezKUnV+y6UGUwBc47T3Q3RooktKQd8ATkdLg+Nm4WRAkPQnBVzOz4SCzNzm0nU20C1IzodAI9giSK8lgPs65aky4Aw6zNBUU9l+CDEqThSaSuyNz-tLSW16pA9Tg5EDAMclEWDVFVsLg6izi5hC8FAWyBTWj8NqSOj4Lnks1A8zh0KFEsKVE5cWlXQJo4VDgycWQ3BHy4Lnzuz5YShYByBIACZ7Urt5gJJpVThak6RDg2DVslAxwGzBwmyvQeLKK+KNzA9Lh6LMKJimKD9J0iT+9Zpoowx1K4SIMxloNYwdSMLENlFxJI8FdeMAIAwVgn1NALKTSYYbKNJdKHLsLmKNhNgFAG52s6ksDvLxsIhH9ZTEQfM5tmsos2sls4tbCo1OTDBvpNB9hJ84woT4FyLYKxtXMCtqo1jCj19FTpEmtItWs3A0rOt5LkdIw6YORb0TzqzLiBC2iKLMgYq5tvQFtUrYtmrI8PpNtnAQojhcCMcLK5sYIRrGqxqVsQqfQGDlgXT3ZrA-SGNOVX9NhfY65C9MTHBwp-iXAeroL2z3g5s0UUqVrlsMqthQZqBbAcNglIFrqHM+rftEK5tWQoi6kwxDhvpFIRVeV3oxVDBZ9SK2y-qDt+FbSarmNFJjilhoIPBZJ5Iq8eklKhwm5YIfR25CrkliqDsPyUb3jX9rA+NYIJj-R3pKQgL5oxxoFGYFgBpW5NCECOV1lRJNgMcVA9B-RQaNIm4bcGdholtjgAxFJvtkQK0qA89ScXZODYwDBTyXDadgx7SAw6bEy0CFayaGFVRKJGAIAvkEw1b9h3r1sbYhwtaFBAZBwKQJL5oQZgIPAss5tORlr2t0qWrEBNhYw7BIx6CEJUUdAYx1dvAgA */
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
