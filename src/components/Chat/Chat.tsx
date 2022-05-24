import React, { useCallback, memo, FC, useRef, useState } from 'react';
import styled from 'styled-components';

import { useChat } from '../../module/useChat/useChat';
import { ChatMessage } from './ChatMessage';
import { PageHeader } from '../PageHeader';
import { TextArea } from '../TextArea';
import { Button } from '../Button';
import { FileSharing } from '../FileSharing/FileSharing';

const MessageButton = styled(Button)`
  flex: 0 1%;
`;
const StyledFileSharing = styled(FileSharing)``;
const MessageTextArea = styled(TextArea)`
  text-align: left !important;
`;
const MessageForm = styled.form`
  width: 100%;
  display: flex;
`;
const MessagesInnerContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
const MessagesContainer = styled.div`
  width: 100%;
  overflow-y: scroll;
  display: flex;
  flex-direction: column-reverse;
  border: 1px solid black;
  border-top: none;
  border-bottom: none;
  flex: 1;
`;
const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1 0;
`;

export const Chat: FC = memo(function Chat() {
  const { chatMessages, sendTextChatMessage } = useChat();
  const [messageToSend, setMessageToSend] = useState<string>('');
  const formRef = useRef<HTMLFormElement>();

  const send = useCallback(() => {
    sendTextChatMessage(messageToSend);
    setMessageToSend('');
  }, [sendTextChatMessage, messageToSend, setMessageToSend]);

  const handleTextAreaChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setMessageToSend(event.target.value);
    },
    [setMessageToSend],
  );

  const handleTextAreaKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      if ((event.which !== 13 && event.keyCode !== 13) || event.shiftKey) return;
      if (!formRef.current) return;

      event.preventDefault();
      event.stopPropagation();
      send();
    },
    [send],
  );

  const handleSubmit: React.FormEventHandler = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      send();
    },
    [send],
  );

  return (
    <Container>
      <PageHeader>Chat</PageHeader>
      <MessagesContainer>
        <MessagesInnerContainer>
          {chatMessages.map((chatMessage) => (
            <ChatMessage key={chatMessage.id} chatMessage={chatMessage} />
          ))}
        </MessagesInnerContainer>
      </MessagesContainer>
      <MessageForm ref={formRef as React.MutableRefObject<HTMLFormElement>} onSubmit={handleSubmit}>
        <StyledFileSharing />
        <MessageTextArea
          placeholder="Message..."
          value={messageToSend}
          onChange={handleTextAreaChange}
          onKeyDown={handleTextAreaKeyDown}
        />

        <MessageButton type="submit">Send</MessageButton>
      </MessageForm>
    </Container>
  );
});
