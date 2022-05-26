import React, { FC, useState, MouseEventHandler, ChangeEventHandler, FormEventHandler, memo } from 'react';
import styled from 'styled-components';

import { connectionDescriptionValidator } from '../util';
import { decode } from '../util';
import { PageHeader } from './PageHeader';
import { Button } from './Button';
import { TextArea } from './TextArea';
import { useChat } from '../module/useChat/useChat';
import { ConnectionDescription } from '../module/PeerConnection/PeerConnection';

const InvitationTextArea = styled(TextArea)`
  display: flex;
  flex: 1 0;
  [placeholder] {
    text-align: center;
  }
`;
const HostButton = styled(Button)`
  width: 100px;
`;
const SlaveButton = styled(Button)`
  width: 100px;
  margin-top: 4px;
`;
const ErrorMessage = styled.div``;
const Form = styled.form`
  display: flex;
  flex: 1 1;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
const Card = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  flex: 1;
  padding: 20px;
`;
const Or = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 20px;
  height: 20px;
  font-size: 10px;
  background-color: black;
  color: white;
  border-radius: 50%;
  transform: translate(-50%, -50%);

  > span {
    transform: translate(0.5px, -1.5px);
    line-height: 1;
  }
`;

const Card2 = styled(Card)`
  width: 100%;
  border-left: 1px solid black;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  &:first-child {
    border-left: none;
  }
`;
const CardContainer = styled.div`
  position: relative;
  display: flex;

  flex: 1 0 0;
  display: flex;
  flex-direction: row;

  align-items: stretch;
  border: 1px solid black;
  border-top: none;

  /* > ${Card} {

  } */
`;

const SlaveButWrap = styled.div`
  flex: 1;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 0;
`;

export const HostOrSlave: FC = memo(function HostOrSlave() {
  const { startAsHost, startAsSlave } = useChat();
  const [connectionDescription, setConnectionDescription] = React.useState<string>('');
  const [error, setError] = useState<string>('');

  const handleHostBtnClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    startAsHost();
  };

  const handleConnectionDescriptionInputChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setError('');
    setConnectionDescription(event.target.value);
  };

  const handleSlaveFormSubmit: FormEventHandler = (event) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      const connectionDescriptionObject = decode(connectionDescription);
      if (connectionDescriptionValidator(connectionDescriptionObject)) throw new Error();
      startAsSlave(connectionDescriptionObject as ConnectionDescription);
    } catch (error) {
      setError('Connection Description invalid!');
    }
  };

  return (
    <Container>
      <PageHeader>Select how would you like to start a chat</PageHeader>
      <CardContainer>
        <Card2>
          <HostButton onClick={handleHostBtnClick}>New chat</HostButton>
        </Card2>
        <Card>
          <Form onSubmit={handleSlaveFormSubmit}>
            <InvitationTextArea
              value={connectionDescription}
              onChange={handleConnectionDescriptionInputChange}
              placeholder="Invitation code here..."
            />
            {!!error && <ErrorMessage>{error}</ErrorMessage>}
            <SlaveButWrap>
              <SlaveButton type="submit">Join a chat</SlaveButton>
            </SlaveButWrap>
          </Form>
        </Card>
        <Or>
          <span>or</span>
        </Or>
      </CardContainer>
    </Container>
  );
});
