import React, { useState, createRef, FC, memo, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import copy from 'copy-to-clipboard';

import { encode, decode } from '../util';
import { connectionDescriptionValidator } from '../util';
import { PageHeader } from './PageHeader';
import { TextArea } from './TextArea';
import { Button } from './Button';
import { useChat } from '../module/useChat/useChat';
import { ConnectionDescription } from '../module/PeerConnection/PeerConnection';

import { QRCodeSVG } from 'qrcode.react';
import { useStatechart } from '../module/PeerConnection/createPeerConnection';

const ErrorMessage = styled.div``;
const StyledTextArea = styled(TextArea)`
  display: flex;
  flex: 1 1 100%;
  [placeholder] {
    text-align: center;
  }
`;
const ConnectButton = styled(Button)`
  width: 70%;
  margin-top: 4px;
`;
const CopyButton = styled(Button)`
  width: 70%;
  margin-top: 4px;
`;
const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 0 0;
  width: 100%;
`;
const Instruction = styled.div`
  font-size: 10px;
  color: black;
  margin-bottom: 4px;
`;
const Step = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  width: 18px;
  height: 18px;
  background-color: black;
  color: white;
  font-size: 10px;
  border-radius: 50%;
  line-height: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;

  > span {
    display: inline-block;
    transform: translate(0.5px, -0.5px);
  }
`;
const Card = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  border: 1px solid black;
  border-top: none;
  flex: 1 1 0;
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
`;

export interface HostProps {
  connectionDescription: ConnectionDescription;
  onSubmit: (remoteConnectionDescription: ConnectionDescription) => any;
}

export const Host: FC = memo(function Host() {
  const { localConnectionDescription, setRemoteConnectionDescription } = useChat();
  const [remoteConnectionDescriptionInputValue, setRemoteConnectionDescriptionInputValue] = useState<string>('');
  const [error, setError] = useState<string>('');
  const copyTextAreaRef = createRef<HTMLTextAreaElement>();

  const encodedConnectionDescription = useStatechart
    ? localConnectionDescription
    : encode(localConnectionDescription as ConnectionDescription);

  const [pasteDone, setPasteDone] = useState(false);

  const handleCopyClick = () => {
    if (!copyTextAreaRef.current) return;

    copyTextAreaRef.current.select();
    copy(encodedConnectionDescription as any);
  };

  const handleRemoteConnectionDescriptionInputChange: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setError('');
    setRemoteConnectionDescriptionInputValue(event.target.value);
  };

  const handleSubmit /*: React.FormEventHandler*/ = useCallback(
    (event?) => {
      try {
        event?.stopPropagation();
        event?.preventDefault();
        const connectionDescriptionObject = decode(remoteConnectionDescriptionInputValue);
        if (connectionDescriptionValidator(connectionDescriptionObject)) throw new Error();
        setRemoteConnectionDescription(connectionDescriptionObject as ConnectionDescription);
      } catch (error) {
        setError('Connection Description invalid!');
      }
    },
    [remoteConnectionDescriptionInputValue, setRemoteConnectionDescription],
  );

  const pasteFromClip = () => {
    navigator.clipboard.readText().then((cliptext) => {
      setRemoteConnectionDescriptionInputValue(cliptext);

      setPasteDone(true);
    });
  };

  useEffect(() => {
    if (remoteConnectionDescriptionInputValue !== '') {
      handleSubmit();
      // console.log('DONE');
    } else {
      // console.log('nope..');
    }
  }, [pasteDone]);

  return (
    <Container>
      <PageHeader>Starting a new chat</PageHeader>
      <Card>
        <Step>
          <span>1</span>
        </Step>
        <Instruction>Send this code to your buddy:</Instruction>
        <QRCodeSVG value={encodedConnectionDescription as string} />
        <StyledTextArea ref={copyTextAreaRef} value={encodedConnectionDescription as string} readOnly />
        <CopyButton onClick={handleCopyClick}>Copy to clipboard</CopyButton>
      </Card>
      <Card>
        <Step>
          <span>2</span>
        </Step>
        <Form onSubmit={handleSubmit}>
          <Instruction>Code from your buddy:</Instruction>
          <StyledTextArea
            value={remoteConnectionDescriptionInputValue}
            onChange={handleRemoteConnectionDescriptionInputChange}
            placeholder="Paste an answer code"
          />
          <ConnectButton onClick={pasteFromClip}>📋 Paste and Connect</ConnectButton>
          <ConnectButton type="submit">Connect</ConnectButton>
        </Form>
        {!!error && <ErrorMessage>{error}</ErrorMessage>}
      </Card>
    </Container>
  );
});
