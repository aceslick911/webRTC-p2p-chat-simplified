import { waitFor } from 'xstate/lib/waitFor';
import { CreatePeerConnectionProps, CreatePeerConnectionResponse } from './createPeerConnection';

const CHANNEL_LABEL = 'P2P_CHAT_CHANNEL_LABEL';

export const stMode = ({
  dispatch,
  connectionState,
  iceServers,
  onChannelOpen,
  onMessageReceived,
  remoteDescription,
  connectionActor,
}: CreatePeerConnectionProps) => {
  const disp = (type, payload?) => {
    const ev = { type, ...(payload || {}) };
    console.log('DISPATCHED', ev);
    dispatch(ev);
  };
  // const peerConnection = new RTCPeerConnection({
  //   iceServers,
  // });

  const peerConnection = () => {
    return connectionState().peerConnection;
  };

  let channelInstance: RTCDataChannel;

  // const setupChannelAsAHost = () => {
  //   console.log('>>setupChannelAsAHost', {});
  //   dispatch('setupChannelAsAHost');

  //   try {
  //     channelInstance = peerConnection().createDataChannel(CHANNEL_LABEL);

  //     channelInstance.onopen = () => {
  //       console.log('>>HOST.onopen', {});
  //       disp('channelInstance.onopen');
  //       onChannelOpen();
  //     };

  //     channelInstance.onmessage = (event) => {
  //       console.log('>>HOST.onmessage', { event });
  //       onMessageReceived(event.data);
  //     };
  //     // disp('setupChannelAsAHost', { channelInstance } as any);
  //   } catch (e) {
  //     console.error('No data channel (peerConnection)', e);
  //   }
  // };

  // const createOffer = async () => {
  //   console.log('>>createOffer', {});
  //   const description = await peerConnection().createOffer();
  //   peerConnection().setLocalDescription(description);

  //   disp('CREATE_OFFER');
  // };

  const setupChannelAsASlave = () => {
    console.log('>>setupChannelAsASlave', {});
    peerConnection().ondatachannel = ({ channel }) => {
      channelInstance = channel;
      channelInstance.onopen = (ev) => {
        console.log('>>SLAVE.onopen', { ev });
        onChannelOpen();
      };

      channelInstance.onmessage = (event) => {
        console.log('>>SLAVE.onmessage', { event });
        onMessageReceived(event.data);
      };
    };
  };

  const createAnswer = async (remoteDescription: string) => {
    console.log('>>createAnswer', { remoteDescription });
    await peerConnection().setRemoteDescription(JSON.parse(remoteDescription));
    const description = await peerConnection().createAnswer();
    peerConnection().setLocalDescription(description);
  };

  const setAnswerDescription = (answerDescription: string) => {
    console.log('>>setAnswerDescription', { answerDescription });
    // peerConnection().setRemoteDescription(JSON.parse(answerDescription));
    //disp('setAnswerDescription', { answerDescription } as any);

    disp('CLIENT_ANSWER', { answer: answerDescription });
  };

  const sendMessage = (message: string) => {
    console.log('>>sendMessage', { message });
    if (channelInstance) {
      channelInstance.send(message);
    }
  };

  return new Promise<CreatePeerConnectionResponse>(async (res) => {
    disp('CONNECT');
    const actor = connectionActor();
    await waitFor(
      actor,
      (state) => {
        console.log('WAITING', state.hasTag('peerConnection'), state);
        return state.hasTag('peerConnection');
      },
      { timeout: 0 },
    );
    console.log('🏁 DONE WAITING!!!!!');

    if (!remoteDescription) {
      // setupChannelAsAHost();
      disp('setupChannelAsAHost');

      await waitFor(connectionActor(), (state) => state.hasTag('peerConnection'));
      // createOffer();

      await waitFor(connectionActor(), (state) => state.hasTag('hostOffer'));
      const { context } = connectionActor().state;
      console.log('OFFER DONE', context);
      res({
        localDescription: context.localDescriptorConfigured, //JSON.stringify(peerConnection().localDescription),
        setAnswerDescription,
        sendMessage,
      });

      //disp('CREATE_OFFER');
    } else {
      setupChannelAsASlave();
      createAnswer(remoteDescription);
    }

    // peerConnection().onicecandidate = (e) => {
    //   console.log('>>onicecandidate', { e });
    //   console.log('ICE', e, e?.candidate?.address);

    //   if (e.candidate === null && peerConnection().localDescription) {
    //     peerConnection().localDescription.sdp.replace('b=AS:30', 'b=AS:1638400');
    //     res({
    //       localDescription: connectionActor().context.localDescriptorConfigured,
    //       setAnswerDescription,
    //       sendMessage,
    //     });
    //     // res({
    //     //   localDescription: JSON.stringify(peerConnection().localDescription),
    //     //   setAnswerDescription,
    //     //   sendMessage,
    //     // });
    //   }
    // };
  });
};
