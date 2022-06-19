import { ConnectionState } from '../../machines/connection';
import { stMode } from './stateChartConnection';
import { funcMode } from './static';

export interface CreatePeerConnectionProps {
  remoteDescription?: string;
  iceServers?: RTCIceServer[];
  onChannelOpen: () => any;
  onMessageReceived: (message: string) => any;

  dispatch: (event: any) => void;
  onConnectionEvent: (handler: (event: any) => void | any) => void;
  connectionState: () => ConnectionState;
  connectionActor: () => any;
}

export interface CreatePeerConnectionResponse {
  localDescription: string;
  setAnswerDescription: (answerDescription: string) => void;
  sendMessage: (message: string) => void;
}

const useStatechart = true;

export const createPeerConnection = async ({
  remoteDescription,
  iceServers = [],
  onChannelOpen,
  onMessageReceived,
  dispatch,
  onConnectionEvent,
  connectionState,
  connectionActor,
}: CreatePeerConnectionProps): Promise<CreatePeerConnectionResponse> => {
  if (useStatechart) {
    return stMode({
      dispatch,
      connectionState,
      onConnectionEvent,
      iceServers,
      onChannelOpen,
      onMessageReceived,
      remoteDescription,
      connectionActor,
    });
  } else {
    return funcMode({ dispatch, iceServers, onChannelOpen, onMessageReceived, remoteDescription });
  }
};
