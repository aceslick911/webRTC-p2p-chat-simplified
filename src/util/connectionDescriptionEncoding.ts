import { Base64 } from 'js-base64';

import { ConnectionDescription } from '../module/PeerConnection/PeerConnection';

export function encode(connectionDescription: ConnectionDescription): string {
  // console.log({ connectionDescription });
  console.log('ENCODED!@#!@#!', connectionDescription);
  return Base64.encode(JSON.stringify(connectionDescription));
}

export function decode(connectionDescriptionCode: string): ConnectionDescription {
  const connectionDescription = JSON.parse(Base64.decode(connectionDescriptionCode));
  // console.log({ connectionDescription });
  return connectionDescription;
}
