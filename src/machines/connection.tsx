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
  /** @xstate-layout N4IgpgJg5mDOIC5QGED2A7dYDGAXAlhgLICG2AFvlgHT4QA2YAxMgPIBy7AosgCqKgADqlj4CGASAAeiAKwAmAOzUAzAAZ5KgCwAORVrUA2FYZ0AaEAE9EAWkOLD1fWrXaAjLq1bDbgL6+LNEwccXRSCiowamwMLDwqKGoAdzAAIwAlXmRqQTAwACcguNDo-LASAnQoAAU8wtiQwnQmAGVeAEFMgH1qri50rrZOHl4ASQ5JYVFQyRkEA3lqNTc1LQBOHVXTRVkLawQ3WQ3qNbd5LUU3Q3krjS1-QIb44jJKGhjg+KrktMzs3IKRUaGGosAKADd8Ng4NFyCRgvRSuVcJBWlxeIMABLtYYAGS6o3YbRxyC4kxEYias0QV0u1FkhnWim0yxUKk0expdJUelkRzUazWO2W8geICBzzCr0i0SelUSKQyWRydQlJTB+Uh0NgsPhWER2DKFVRFD1YHoo3QsFw8Oh1AwrFy6HJ0ypSGkNJ0Okcl3kam9ig2OgMhk5CFO9L0WhUO0UyyMa0MYrVTXCbyiH2KCR+Sv+qrlTVBEKhMNNCPtTqYxDgsBIMBdlIk7rmbkDOicQqMPgTWnk5isiBUh2oV2uawZre8ikUyYLLwi7wL30VfxVgLn6CLmpLOoAZvRUEkdYIoQBrJhg3AAV0EyDhCPasHamJEuAbM2biGni1kOjc-8MX9XEUHR5DDGxW2oP1A1OLRf1kbxE3uAJxQ3NMZUzRpl1+ZUAXqT51WLbVqH3Q9jzPC8wGvW9731R92haegSHBMB3zdUAW3-NQOz9ZY+VkEDFDAgcEAg5RoMFDx4MQxlZwI1NpUXeTsNzNd8KzEENS1GFSKPagX2tJEKgSVhd13AomAgDAoiocFUFPDMjRRGxUDMgo2KbDiv2DVRTg0RMQNcWQ3DDTQ3BHGNDFMNYXGAtY5I0qUFwzJcFRwvN13kzSiJ0g89IM3AjPlUzzPyNEMVxVhkHafEABEuBaZB0lGapeFYdIPOdT95h2agdFkNQFEOAahN7LQwzcdlVAuLwYpi+R+OQx4sqS9NZWUtLVLwlNsu3YjdJ1ArkhISkqgAMVQfJ2itFIyuQXFRi4dgMRxFoAHV+k66kEEDbi-V0FxjEFEww3WNZ6R8ccosm9l4pQnbVow1Kc1XbaNy3bS9zyw7X2O06oAuwpaPNJgy31e10EdMAuqECkPy8n61kWUwFGFXs3GDYT9kA8KFvkTRrl-NZtFFeG0MUlKNpR3D8xWjGdxI7HqGQeh8GpwqkhO+VCZKizMVYNoulYM6zs+90pkbGmPQODwVA7IUvVOGKozDdRwsMLsHEFHZg1kBLgURpSsxU1HZcS+X9qVlW1fQQrDWRSBrtgW6mFej70i4Wqun1tovu6-8lBHBQBJ5I4RcUUH1BOQw1i8OCTC0K4VH9yV0KDrDNtDzLw60hWDuV1X1bx7XLrvM16FJ4nEQdJ084Z-82SgtkDGWf9o2ZMMeaghQBYWnRhd7FvQjbyXg87mXu4DiPcrI3VcHlEj8EYXh8nhWBSuoXBX6tUr0jAABHK8cBcBMDKAAKxCJAOe1szhxhOCBdY69+p9jDP1O2goBZeHsLJMWK0T7rTPtLDK6kr690jrfU099sy7ifmAF+b8P5fwYQUP+gDgFMDINCQQuB6E-3cubOm7EYH+mUDGfeKhgq6H6rsES-4ziqBcL6JQA11B+1wYlfBmEvjn2IQja+WMKFwiod8Ghz9v7vwKEWdAEAEhnVoZZaytB0B2QcsrcWyUCEdyIWpPRZCb56UoQ-UxdDzEfzBNY2xtCEC2VQNgYyGAADaagAC60C5henCkJaRUYop8hUBNaMjg+wSK9IyYMHslqoTwRLTx2jvFozln4gxASjFBNobwix+QrE2POvYgo+RLo5CYrgXcl0AC2bjqkeK0Q-FcF8SGSn0YrQxFQ2lmOYV08JPSCZRJiXE0ISTUkCNdJ5a2zJwarFuC4ccNwCkmCgjoEwUZG6wTUctDRNSZnZjmbo9GTTlktNWdQ9poTLEnmwKeOxz9UAtGphASi1iOm-wAUA60aTEDlJODGDmsVpwrDWBNNQDgIrGFWMLb0fYZzqIDpo5GPyfF-Jys0nUgTgXrL4V09AqAkUWS2VC1ixzLbfX3txJ55xmRnAFHyMMUNqB1xFHoL0g0j4KWmXS9KDLGlMoBSy1pbKQkbOoFynlZU8Kwoib0xg6KDj+kWGcdYgFXBCjcLXGVDI5XRg2HIiRCg4bvJpZ89VW0w6kO1f3VlJiQWGs1vjXgMKbT5BAbwdIr1TYDGJJka1KxiWTQQi6xVebQyyPOLIekRwsl8l9iYFV841pfJDvM3xYalYRsSMEk1w8EhxvaNgLhICM0YmTams2tMTlW3SQJEck0XBKHkDFF5E0biOFkGyTYeSXDeGbtS1ugapb0oaT3ZtKzjFtqjRy6gZRoT4EhJa5gVkaAxNcQjWle6NUHtDXtfxuqgWRvZZ0i9OAwDXsiYwaJzjYnxPQIcrNLrlDGAGgyYMm7Hl3KKY87YXgXWHBrYHU+Xj90hsWf88Nerf0GvPZeoDN6dmMCYP0wZghhmjPyBM59u7CEEcvkRo9gKT2Pz-R-SjwHb1gbsvspo0HBX02EQYPqcE4JMyQx4It+xbZoaefoF5UkcMvo42+wjhFP3MrvvKFglUWhcEGBwbgfBxjsCzZ6pwuhgq1wQjXIlYY4xaHpK2VYgYEJzujDp9j+H9NccM5jHVDiaDWmNJMj5arX3BvC4WYj2Ms3Q23h7FQMVJqHCuKgv800-zCiHH6a4wXEt6eSws0I0WbLgdceQV8NhE3YBsF805FtpNzBuHyJwEiQJ9iBgVkSHtFhBiHKBeQjIkzbuPiFupnHatNDo-kAZXTGMVGYxM5r1pWu4Ha51q23WhG9cOOJHLI3NCafGiJBQjhTjTnsK2aKK7-AoS5RAOAkg2MeLoFaqTZ3Byyf3jXbQm6NDFPAqYO26htBRl-N6QUlW61Bq7itkE8djJVFqClrrgjTlzDUAUudSx-I+qBhcUW-qd1VdCzVptRndTlmxyiCAWbLiluUeOHLLqEP9n2P1JYjy+Ssn3kcWuqOkZJYx0zyLZNzQVmplm4Wpb2S+u9pcGK+TZE+RMMLVRZwD5Bfm6qtHsvG2MuZ4r+gGWLgQyZCyGGHIRI2B5H1Hk6hSs8iUJUv7Fvqty+t5F-u4LTzWsFO2ac45JqJg8N6EKbvrj2xm8YHwmh95+DN7WmXQerdauZ-3I6bOTJuXyNa7XTm5q9h2EoIShLRWmDnTFDQLrvA06qQlwPDPg+F9D0rI6MaR5XRuvw0dQrupezlbHzYF2BJM1dlNZvGfDiaCOBcaX7clthcx5uNLt8h9a1saPKelfAJysAn17sRxTBhj5N54KfI51udydn2nC36c78ZyHvug-XzWpwThT9SDR9YjTnDnChSiKJjCwbCrBsjfhb54bf596HpF5RyDyxydrnSXS6wV5A5E40j-jKC85eDAT+gXBJ77D8zebGAxgrpCR5pzpbof7m55694F5oED63zRxDxs6Jxj74ET49ZEEuoRSthxjaAbDBRcyDg+ByqaDCwcx+guZIG1KzK77y5-48GYEazH44FEzjwwZGBLAwxx6tgCQ1z34IQ+Z5L9SG77z+7uI94oGcEfrcF6S8GxxZq2qmFsjmGxhWGyLBTUBRSKFwTKIMgaBqH1o6KapcHaG8ZrLkb-pMIcqsKopvgEHjo0hGDeYaAewMghjrBeiEpeBOCKIrAMiAQKAxHo5uHcboHHrJEdpbIgYCrCHA4IC+x9SKEVLFwXAEqyLqAXIU58hU5CR1GW6-L96JHfp8btqgqbZnj8pxrmoc7ZHCoO4v6Ur7zBgJiEorCqD6DMiNwgSCgCRTH54zEJHkJJH6odrGpLGR7C7I6xRMgWFDFC4O5SJwQaBubehXEcE3HuFzEmYPFLHYFQBrEJpZGdGEE2pwKtiPLOySqTgTStjhTeDLAGAeALT2BvJd4Bpf4aE-6zF3HzEtGQnD5dqoA9p9rWqcxloMi1xxRg4YkSIQxxjIJDhCiTE564bqHfKaG-4UnglkYdpCbUb8o+HuonExgwEzbRi66qYjHk7MHjE5bU5AmuEgmNEeGUkQkbKV7DiXIezXJDSeb6A+ZxhmmNyHBOFTIuGkmoGglimtrWo1zhRmmxQ3JUFfjLD0hwSMgOqCyAkCm6bAnxFulfqPzoD4CwDkCQBjwnoOayaHDSKwz2GnCoI-Feh-ELTeDhmsG57b4ukNERZglYBJAAAEsWKINZbgPhnJRKzIegM20EMYm8oxg0pgmwcYkqc2JZgpsR9SBmqWPG8Amx3UtefUCGYBRKEBd2+wEEnJ04RgrgrguaO8Op5ZeplZ2ogBrgc5oBw0i5Y04Efo0eLyOWA5lBfIu5wpZJiU1qNgkBbuEijgZS7eugcYDIVKw5kZupr5ug4EvY4MkMLJz2hwpgj5VQr5DebuA0P4c0PI1wvIiYQ5RJdOa0KILGVAxoGx8JORCA-M-WjcNcUUjc6g-o3Z7YrIeWegEqLB2Fn+a0u4J0jAEAcaao1q-M9yM6YOtcgY3goM5wl+667I2g1w1aEZEsr5iY4EOwRS+g5SgE9gM2OgH2vgQAA */
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
        createOffer: machineService<ConnectionState>({
          serviceName: 'createOffer',
          run: async ({ onCallback, event, context }) => {
            if (context.peerConnection) {
              const description = await context.peerConnection.createOffer();

              onCallback({ type: 'SET_LOCAL_DESCRIPTOR', localDescriptor: description });
            }
          },
          onEnd: (event) => {},
          onReceive: (event) => {},
        }),
        // : (c, invokingEvent) => async (callback: (ev: any) => void, onReceive) => {
        //   try {
        //     if (c.peerConnection) {
        //       const description = await c.peerConnection.createOffer();

        //       onReceive((event) => {
        //         console.log('GOT2', event);
        //       });
        //       console.log('✅ createdOffer', { description });
        //       callback({ type: 'SET_LOCAL_DESCRIPTOR', localDescriptor: description });
        //       return description;
        //     } else {
        //       console.log('NOT DEFINED', c);
        //     }
        //   } catch (err) {
        //     callback({ type: 'ERROR', err });
        //     throw err;
        //   }
        //   await new Promise(() => {});
        // },

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

        createRTCPeerConnection: machineService<ConnectionState>({
          serviceName: 'createRTCPeerConnection',
          run: async ({ onCallback, event, context }) => {
            const peerConnection = new RTCPeerConnection({
              iceServers: context.ICEServers,
            });
            onCallback({ type: 'START_PEER_CONNECTION', peerConnection });
          },
          onEnd: (event) => {},
          onReceive: (event) => {},
        }),

        // (c, invokingEvent) => async (callback: (ev: any) => void, onReceive) => {
        //   try {
        //     const peerConnection = new RTCPeerConnection({
        //       iceServers: c.ICEServers,
        //     });
        //     callback({ type: 'START_PEER_CONNECTION', peerConnection });
        //     console.log('✅ Created peer connection', { peerConnection });

        //     onReceive((event) => {
        //       console.log('GOT', event);
        //     });
        //   } catch (err) {
        //     callback({ type: 'ERROR', err });
        //     throw err;
        //   }
        //   await new Promise(() => {});
        // },
      },
    },
  );
