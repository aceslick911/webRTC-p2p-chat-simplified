import React, { FC, createRef, memo } from 'react';
import styled from 'styled-components';
import copy from 'copy-to-clipboard';

import { encode } from '../util';
import { PageHeader } from './PageHeader';
import { Button } from './Button';
import { TextArea } from './TextArea';
import { useChat } from '../module/useChat/useChat';
import { ConnectionDescription } from '../module/PeerConnection/PeerConnection';

import { QRCodeSVG } from 'qrcode.react';
import { useStatechart } from '../module/PeerConnection/createPeerConnection';

const CopyButton = styled(Button)`
  width: 70%;
  margin-top: 4px;
`;
const StyledTextArea = styled(TextArea)`
  display: flex;
  flex: 1 1;
  [placeholder] {
    text-align: center;
  }
`;
const Instruction = styled.div`
  font-size: 10px;
  color: black;
  margin-bottom: 4px;
`;
const Card = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  border: 1px solid black;
  border-top: none;
  flex: 1 0 0;
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const Slave: FC = memo(function Slave() {
  const { localConnectionDescription } = useChat();
  const copyTextAreaRef = createRef<HTMLTextAreaElement>();

  const encodedConnectionDescription = useStatechart
    ? encode({
        description: encode(localConnectionDescription?.description as any),
      } as ConnectionDescription)
    : encode(localConnectionDescription as ConnectionDescription);

  const handleCopyClick = () => {
    if (!copyTextAreaRef.current) return;

    copyTextAreaRef.current.select();
    copy(encodedConnectionDescription);
  };

  return (
    <Container>
      <PageHeader>Joining a chat</PageHeader>
      <Card>
        <Instruction>Send back this code to your buddy:</Instruction>
        <QRCodeSVG value={encodedConnectionDescription} />
        <StyledTextArea ref={copyTextAreaRef} value={encodedConnectionDescription} readOnly />
        <CopyButton onClick={handleCopyClick}>Copy to clipboard</CopyButton>
      </Card>
    </Container>
  );
});
