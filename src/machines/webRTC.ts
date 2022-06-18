import { assign, createMachine } from 'xstate';
import { log, sendParent } from 'xstate/lib/actions';

export const ConnectionMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QHUwCMBKAVAwgWQEMBjACwEsA7MAOjIgBswBiWAFwICdWBBWACQD2bRKAAOQsqzICKIkAA9EARgBsS6koAcazZoCsAdgAsRgEwGAnEYA0IAJ6JTAZiPVdppRdN6lSpxb1NJwBfYNtUTFxCUkoaOkYWdi5eAGV6AgA3MDlxWElpWSQFZUC3I00LFQAGIyqDH3LTWwcELRVqCy1DaqU9J01TU1Dw9Gx8YnIqWgZmWDBWDDAAWwFWMBwZKiIpGQAROCIOMlEdwrEJU7lFBE1XUyNqry8XPT1y5uV+jreAgM8nFTaEJhEARMbRSZxGYsMAUCB4OCwAgwHIXApXEqmDo1SreJxVCxBCwfBAWKodToufHOJyvKpKYag0ZRCaxahETZgbYFWDUURgMAcDYULanJgpACiWAA+gAFCUSjDSnAAeQAcmqJTgsABJdWovKXIrXXx6Dr9TRVJyDPQEvQqPQkvSDagGGn+fpaTwWRlglkxKYckVc068-mC4WigriqXS3bcLDcZV8bgaiUAGQN+RkGNaTnUVRU9yCDpUlgMdRJRlprt0RgCVTevisoRBFAEEDgcj94wDUMYWaNoGu1c01DMVStKgsFnzhhs9k+WKMPgJRde08swJGkV7kPZnO5MjDAqFh6HIFy2bOxQQTgrbk8KipKmrFgMTirKnaBksXQM-z3iovrMnubJBlGx7siQBDBvQOoUGwsFENkRRXheJrONQrx6ISuiWLabqfouCAfq4gSTm6jYriYRggbuELgeePKDuixqIJ05q6FaNp2g6JIAlimhKABzpWnUr4AvR4KslQrE5uxCDVNQ9yPKYzwrm8mgklo1BVKYk6GUZk4Mq2QA */
  createMachine(
    {
      context: {
        // remoteDescription: '' as any,
        iceServers: [
          {
            urls: 'stun:stun.l.google.com:19302',
          },
        ],

        peerConnection: null as any,
        dataChannel: null as any,
      },
      tsTypes: {} as import('./webRTC.typegen').Typegen0,
      id: 'WebRTCMachine',
      initial: 'idle',
      states: {
        idle: {
          on: {
            startAsHost: {},
            startAsSlave: {},
            setRemoteConnectionDescription: {},
            sendMessage: {},
          },
        },
        connections: {
          type: 'parallel',
          states: {
            peerConnection: {
              invoke: {
                src: 'rtcPeerConnection',
                id: 'rtc',
              },
              on: {
                SET_PEER_CONNECTION: {
                  actions: 'setPeerConnection',
                },
                SET_DATA_CHANNEL: {
                  actions: 'setDataChannel',
                },
              },
            },
            channelInstance: {},
          },
        },
      },
    },
    {
      actions: {
        setPeerConnection: assign({
          peerConnection: (c, e: any) => e.peerConnection,
        }),
        setDataChannel: assign({
          dataChannel: (c, e: any) => e.dataChannel,
        }),

        // setupChannelAsAHost: assign({}),
        // createOffer: {},
        // setupChannelAsASlave: {},
        // createAnswer: {},
        // setAnswerDescription: {},
        // sendMessage: {},
        // onicecandidate: {},
      },
      services: {
        rtcPeerConnection: (c, invokingEvent) =>
          new Promise((resolve, reject) => (callback, onReceive) => {
            const peerConnection = new RTCPeerConnection({
              iceServers: c.iceServers,
            });
            callback('SET_PEER_CONNECTION', { peerConnection });

            peerConnection.onicecandidate = (pEvent) => {
              if (pEvent.candidate === null && peerConnection.localDescription) {
                peerConnection.localDescription.sdp.replace('b=AS:30', 'b=AS:1638400');
                callback('ON_ICE_CANDIDATE', {
                  localDescription: JSON.stringify(peerConnection.localDescription),
                });
              }
            };
            let dataChannel = null;
            onReceive: async (e) => {
              switch (e.type) {
                case 'createDataChannel': {
                  try {
                    dataChannel = peerConnection.createDataChannel(e.label, e.dataChannelDict);
                    callback('SET_DATA_CHANNEL', { dataChannel });
                  } catch (err) {
                    callback('SET_DATA_CHANNEL_FAILED', { err });
                  }
                }
                case 'createOffer': {
                  try {
                    const description = await peerConnection.createOffer();

                    callback('OFFER_CREATED', { description });
                  } catch (err) {
                    callback('OFFER_CREATED_FAILED', { err });
                  }
                }
                case 'setLocalDescription': {
                  try {
                    peerConnection.setLocalDescription(e.description);
                    callback('SET_LOCAL_DESCRIPTION', { description: e.description });
                  } catch (err) {
                    callback('SET_LOCAL_DESCRIPTION_FAILED', { err });
                  }
                }
                case 'setRemoteDescription': {
                  try {
                    await peerConnection.setRemoteDescription(e.remoteDescriptionObject);
                    const description = await peerConnection.createAnswer();
                    callback('SET_REMOTE_ANSWER', { description });
                  } catch (err) {
                    callback('SET_REMOTE_ANSWER_FAILED', { err });
                  }
                }
                case 'createAnswer': {
                  try {
                    const description = await peerConnection.createAnswer();
                    peerConnection.setLocalDescription(description);
                    callback('SET_ANSWER', { description });
                  } catch (err) {
                    callback('SET_ANSWER_FAILED', { err });
                  }
                }
                case 'sendMessage': {
                  try {
                    if (!dataChannel) {
                      throw 'No Data Channel to send';
                    }
                    dataChannel.send(e.message);
                    callback('MESSAGE_SENT', { message: e.message });
                  } catch (err) {
                    callback('MESSAGE_SENT_FAILED', { err });
                  }
                }
                case 'setupChannelAsASlave': {
                  peerConnection.ondatachannel = ({ channel }) => {
                    dataChannel = channel;
                    dataChannel.onopen = () => {
                      callback('CONNECTION_OPENED', { dataChannel });
                    };

                    dataChannel.onmessage = (event) => {
                      callback('MESSAGE', { dataChannel, data: event.data });
                    };
                  };
                }
              }
            };
          }),
      },
    },
  );
