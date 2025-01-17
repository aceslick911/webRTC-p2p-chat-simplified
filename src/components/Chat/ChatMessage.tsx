import React, { FC, memo, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';

import { MESSAGE_SENDER } from '../../types/MessageSenderEnum';
import { ChatMessageType } from '../../types/ChatMessageType';
import { useFileBuffer } from '../../module/FileBuffers/FileBuffers';

import _ReactPlayer, { ReactPlayerProps } from 'react-player';
const ReactPlayer = _ReactPlayer as unknown as React.FC<ReactPlayerProps>;

const Text = styled.div``;
const Header = styled.div`
  font-size: 12px;

  > span {
    font-weight: 700;
  }
`;
const Message = styled.div<{ sender: MESSAGE_SENDER }>`
  padding: 4px;
  background-color: greenyellow;
  flex-wrap: wrap;
  display: flex;
  flex: 1;
  flex-direction: column;

  ${({ sender }) =>
    sender === MESSAGE_SENDER.ME
      ? css`
          background-color: cyan;
        `
      : ''};
`;

interface ChatFileMessageType extends ChatMessageType {
  fileId: string;
  blobURL: string;
}

interface ChatFileMessageProps {
  chatMessage: ChatFileMessageType;
}

const ImageContainer = styled.div`
  flex: 1 1;
  padding: 10px;
  margin: 0;
  max-width: 500px;
`;

const ImageOb = styled.img`
  width: 100%;
`;

const ChatFileMessage: FC<ChatFileMessageProps> = memo(function ChatFileMessage({ chatMessage }) {
  const { fileName, fileSize, receivedSize, receivedBlobUrl } = useFileBuffer(chatMessage.fileId);

  const videoRef = useRef() as any;

  useEffect(() => {
    if (receivedSize && receivedSize === fileSize) {
      console.log('DONE!', videoRef);
      if (videoRef?.current?.seekTo) {
        videoRef?.current?.seekTo(0);
      }
    }
  }, [receivedSize, fileSize, videoRef]);

  if (typeof fileSize === 'undefined' || typeof fileName === 'undefined') {
    return (
      <Message sender={chatMessage.sender}>
        <Header>
          <span>{chatMessage.sender === MESSAGE_SENDER.ME ? 'Me' : 'Friend'}</span> (
          {new Date(chatMessage.timestamp).toLocaleTimeString()})
        </Header>
        <Text>File in progress...</Text>
      </Message>
    );
  }

  const FormattedMessage = ({ fileName, blobURL }) => {
    const isImage = !!/\.(jpg|jpeg|gif|bmp|png|tiff|svg|ico)/i.exec(fileName);
    const isVideo = !!/\.(mp4|avi|wmf|3gp|mkv|mov)/i.exec(fileName);

    return (
      <>
        {isVideo ? (
          <ImageContainer>
            <ReactPlayer ref={videoRef} url={blobURL} playing controls width="500px" height="300px" loop />
          </ImageContainer>
        ) : isImage ? (
          <ImageContainer>
            <ImageOb src={blobURL} />
          </ImageContainer>
        ) : (
          <></>
        )}
        <Text>
          <a href={blobURL} download={fileName}>
            Download: {fileName}
          </a>
        </Text>
      </>
    );
  };

  const previewBlob = receivedBlobUrl || chatMessage.blobURL;

  if (!previewBlob) {
    return (
      <Message sender={chatMessage.sender}>
        <Header>
          <span>{chatMessage.sender === MESSAGE_SENDER.ME ? 'Me' : 'Friend'}</span> (
          {new Date(chatMessage.timestamp).toLocaleTimeString()})
        </Header>
        <Text>
          {fileName} SENDING: {Math.floor((receivedSize / fileSize) * 100)}%
        </Text>
      </Message>
    );
  }

  return (
    <Message sender={chatMessage.sender}>
      <Header>
        <span>{chatMessage.sender === MESSAGE_SENDER.ME ? 'Me' : 'Friend'}</span> (
        {new Date(chatMessage.timestamp).toLocaleTimeString()})
      </Header>
      {FormattedMessage({ fileName, blobURL: previewBlob })}
      <Text>
        {fileName} {receivedSize == fileSize ? ` COMPLETE` : `- ${Math.floor((receivedSize / fileSize) * 100)}%`}
      </Text>
    </Message>
  );
});

const ChatTextMessage: FC<Props> = memo(function ChatTextMessage({ chatMessage }) {
  return (
    <Message sender={chatMessage.sender}>
      <Header>
        <span>{chatMessage.sender === MESSAGE_SENDER.ME ? 'Me' : 'Friend'}</span> (
        {new Date(chatMessage.timestamp).toLocaleTimeString()})
      </Header>
      <Text>{chatMessage.text}</Text>
    </Message>
  );
});

interface Props {
  chatMessage: ChatMessageType;
}

export const ChatMessage: FC<Props> = memo(function ChatMessage({ chatMessage }) {
  if (chatMessage.fileId) return <ChatFileMessage chatMessage={chatMessage as ChatFileMessageType} />;

  return <ChatTextMessage chatMessage={chatMessage} />;
});
