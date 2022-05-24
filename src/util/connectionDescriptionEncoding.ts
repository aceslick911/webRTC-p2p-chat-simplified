import { Base64 } from 'js-base64';

import { ConnectionDescription } from '../module/PeerConnection/PeerConnection';

export function encode(connectionDescription: ConnectionDescription): string {
  console.log(connectionDescription);
  return Base64.encode(JSON.stringify(connectionDescription));
}

export function decode(connectionDescriptionCode: string): ConnectionDescription {
  const res = JSON.parse(Base64.decode(connectionDescriptionCode));
  console.log(res);
  return res;
}
