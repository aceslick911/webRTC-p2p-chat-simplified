/* eslint-disable @typescript-eslint/no-use-before-define */
const CHANNEL_LABEL = 'P2P_CHAT_CHANNEL_LABEL';

export interface CreatePeerConnectionProps {
  remoteDescription?: string;
  iceServers?: RTCIceServer[];
  onChannelOpen: () => any;
  onMessageReceived: (message: string) => any;
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
}: CreatePeerConnectionProps): Promise<CreatePeerConnectionResponse> {
  if (useStatechart) {
  } else {
    const peerConnection = new RTCPeerConnection({
      iceServers,
    });

    let channelInstance: RTCDataChannel;

    const setupChannelAsAHost = () => {
      console.log('>>setupChannelAsAHost', {});
      try {
        channelInstance = peerConnection.createDataChannel(CHANNEL_LABEL);

        channelInstance.onopen = () => {
          console.log('>>HOST.onopen', {});
          onChannelOpen();
        };

        channelInstance.onmessage = (event) => {
          console.log('>>HOST.onmessage', { event });
          onMessageReceived(event.data);
        };
      } catch (e) {
        console.error('No data channel (peerConnection)', e);
      }
    };

    const createOffer = async () => {
      console.log('>>createOffer', {});
      const description = await peerConnection.createOffer();
      peerConnection.setLocalDescription(description);
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
