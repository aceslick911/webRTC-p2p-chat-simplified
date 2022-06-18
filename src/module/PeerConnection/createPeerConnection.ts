import { send } from 'xstate';
import { ConnectionState } from '../../machines/connection';

/* eslint-disable @typescript-eslint/no-use-before-define */
const CHANNEL_LABEL = 'P2P_CHAT_CHANNEL_LABEL';

export interface CreatePeerConnectionProps {
  remoteDescription?: string;
  iceServers?: RTCIceServer[];
  onChannelOpen: () => any;
  onMessageReceived: (message: string) => any;

  dispatch: (event: any) => void;
  onConnectionEvent: (handler: (event: any) => void | any) => void;
  connectionState: () => ConnectionState;
}

export interface CreatePeerConnectionResponse {
  localDescription: string;
  setAnswerDescription: (answerDescription: string) => void;
  sendMessage: (message: string) => void;
}

const useStatechart = false;

export function createPeerConnection({
  remoteDescription,
  iceServers = [],
  onChannelOpen,
  onMessageReceived,
  dispatch,
  onConnectionEvent,
  connectionState,
}: CreatePeerConnectionProps): Promise<CreatePeerConnectionResponse> {
  const disp = (type, payload?) => {
    dispatch({ type, payload: payload || {} });
  };
  disp('CONNECT');
  if (useStatechart) {
  } else {
    const peerConnection = new RTCPeerConnection({
      iceServers,
    });

    let channelInstance: RTCDataChannel;

    const setupChannelAsAHost = () => {
      console.log('>>setupChannelAsAHost', {});
      dispatch('setupChannelAsAHost');

      try {
        channelInstance = peerConnection.createDataChannel(CHANNEL_LABEL);

        channelInstance.onopen = () => {
          console.log('>>HOST.onopen', {});
          disp('channelInstance.onopen');
          onChannelOpen();
        };

        channelInstance.onmessage = (event) => {
          console.log('>>HOST.onmessage', { event });
          onMessageReceived(event.data);
        };
        // disp('setupChannelAsAHost', { channelInstance } as any);
      } catch (e) {
        console.error('No data channel (peerConnection)', e);
      }
    };

    const createOffer = async () => {
      console.log('>>createOffer', {});
      const description = await peerConnection.createOffer();
      peerConnection.setLocalDescription(description);

      disp('CREATE_OFFER');
    };

    const setupChannelAsASlave = () => {
      console.log('>>setupChannelAsASlave', {});
      peerConnection.ondatachannel = ({ channel }) => {
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
      await peerConnection.setRemoteDescription(JSON.parse(remoteDescription));
      const description = await peerConnection.createAnswer();
      peerConnection.setLocalDescription(description);
    };

    const setAnswerDescription = (answerDescription: string) => {
      console.log('>>setAnswerDescription', { answerDescription });
      peerConnection.setRemoteDescription(JSON.parse(answerDescription));
      disp('setAnswerDescription', { answerDescription } as any);
    };

    const sendMessage = (message: string) => {
      console.log('>>sendMessage', { message });
      if (channelInstance) {
        channelInstance.send(message);
      }
    };

    return new Promise((res) => {
      peerConnection.onicecandidate = (e) => {
        console.log('>>onicecandidate', { e });
        console.log('ICE', e, e?.candidate?.address);
        if (e.candidate !== null && peerConnection.localDescription) {
          const {
            address,
            candidate,
            component,
            foundation,
            port,
            priority,
            protocol,
            relatedAddress,
            relatedPort,
            sdpMLineIndex,
            sdpMid,
            tcpType,
            type,
            usernameFragment,
          } = e.candidate;
          // console.log({
          //   address,
          //   candidate,
          //   component,
          //   foundation,
          //   port,
          //   priority,
          //   protocol,
          //   relatedAddress,
          //   relatedPort,
          //   sdpMLineIndex,
          //   sdpMid,
          //   tcpType,
          //   type,
          //   usernameFragment,
          // });
        }

        if (e.candidate === null && peerConnection.localDescription) {
          peerConnection.localDescription.sdp.replace('b=AS:30', 'b=AS:1638400');

          res({
            localDescription: JSON.stringify(peerConnection.localDescription),
            setAnswerDescription,
            sendMessage,
          });
        }
      };

      if (!remoteDescription) {
        setupChannelAsAHost();
        createOffer();
      } else {
        setupChannelAsASlave();
        createAnswer(remoteDescription);
      }
    });
  }
}
