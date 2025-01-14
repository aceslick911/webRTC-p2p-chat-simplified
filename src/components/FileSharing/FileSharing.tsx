import React, { Fragment, useRef, FC, ChangeEventHandler, MouseEventHandler, memo, useCallback } from 'react';
import styled from 'styled-components';
import shortid from 'shortid';

import { Button } from '../Button';
import { useChat } from '../../module/useChat/useChat';
import { arrayBufferToString } from '../../util';

export interface FileSharingProps {
  className?: string;
}

const Input = styled.input`
  display: none;
`;
const StyledButton = styled(Button)``;

export const FileSharing: FC<FileSharingProps> = memo(function FileSharing({ className }) {
  const { sendFileInfo, sendFileChunk } = useChat();
  const inputRef = useRef<HTMLInputElement>() as React.MutableRefObject<HTMLInputElement>;

  const handleButtonClick: MouseEventHandler<HTMLButtonElement> = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!inputRef.current) return;
      inputRef.current.click();
    },
    [inputRef],
  );

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const file = event.target.files?.[0];

      if (!file) return;

      const fileId = shortid.generate();
      const BYTES_PER_CHUNK = 1200;
      const fileReader = new FileReader();
      let currentChunk = 0;

      const readNextChunk = () => {
        const start = BYTES_PER_CHUNK * currentChunk;
        const end = Math.min(file.size, start + BYTES_PER_CHUNK);
        fileReader.readAsArrayBuffer(file.slice(start, end));
      };

      fileReader.onload = () => {
        if (!(fileReader.result instanceof ArrayBuffer)) return;

        sendFileChunk({
          fileId,
          fileChunkIndex: currentChunk,
          fileChunk: arrayBufferToString(fileReader.result),
          // blobURL: URL.createObjectURL(new Blob(fileReader.result)), //!
        });
        currentChunk++;

        if (BYTES_PER_CHUNK * currentChunk < file.size) {
          readNextChunk();
        }
      };

      const previewReader = new FileReader();

      previewReader.onload = () => {
        console.log('READER', previewReader);
        // if (!(typeof previewReader.result !== 'string')) {
        //   console.log('NOT STRING', previewReader.result);
        //   return;
        // }

        sendFileInfo({
          fileId,
          fileName: file.name,
          fileSize: file.size,
          //URL.createObjectURL(new Blob(
          blobURL: previewReader.result as any as string,
          //)) //!
        });
      };

      previewReader.readAsDataURL(file);

      readNextChunk();
    },
    [sendFileInfo, sendFileChunk],
  );

  return (
    <Fragment>
      <Input ref={inputRef} type="file" name="file" onChange={handleInputChange} />
      <StyledButton className={className} title="Upload" onClick={handleButtonClick}>
        <span role="img" aria-label="paperclip emoji">
          📎
        </span>
      </StyledButton>
    </Fragment>
  );
});
