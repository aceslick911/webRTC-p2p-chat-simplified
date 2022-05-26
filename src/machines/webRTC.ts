import { assign, createMachine } from 'xstate';
import { log, sendParent } from 'xstate/lib/actions';

export const ConnectionMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QHUwCMBKAVAwgWQEMBjACwEsA7MAOjIgBswBiWAFwICdWBBWACQD2bRKAAOQsqzICKIkAA9EARgBsS6qoDsATm0AmAMyaVAViV6ADJoA0IAJ6JDJ6haW6AHABY9n97qXu7gC+QbaomLiEpJQ0dIws7Fy8AMr0BABuYHLisJLSskgKyibu1O4Glgba5iYmFp4WerYOCAGaLm66euaentom2iFh6Nj4xORUtAzMsGCsGGAAtgKsYDgyVERSMgAicEQcZKLbBWISJ3KKCF7Uhp5GfkaaJpZKzcpVHbrfPx5DIOFRlEJrFpiwwBQIHg4LACDBsud8pdinoytoLCoGs8lBYLO4LCZ3ghqi5LLjNO5nnUGnp-oDIuMYtQiBswFt8rBqKIwGAOOsKJsTkxkgBRLAAfQACiKRRhxTgAPIAOSVIpwWAAksqEbkLoUrkolM59CYKTUiS8DF9tJofAZTfbgqEASMGdFJiyBWyTpzubz+YL8sKxeKdtwsNx5XxuCqRQAZHV5GTI1oGdT1FSBTNKComFT1In3FTW233B0lTwhZ0UAQQOByeljd2gxiJvWgA2GagqboWbRGQn2RyBEsqIwGXwUkx011NkHM1nsmS+nl8xftkA5JOnIoITQ2IcINTOVy6Uv2zSOmcROdMz2B5fMkgEL30DUUNgvohZQpbjedq0TCqKwLAHalGiJS8T06c9yydYYb2BO91w5NskX1RAgKJAwx2tLwfD8apBmdRskKoNDkwwhA9G0IkAmtX5firIIgA */
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
          peerConnection: (c, e) => e.peerConnection,
        }),
        setDataChannel: assign({
          dataChannel: (c, e) => e.dataChannel,
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
