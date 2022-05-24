import styled from 'styled-components';

export const TextArea = styled.textarea`
  &[placeholder] {
    text-align: center;
  }
  display: block;
  font-size: 10px;
  width: 100%;
  height: 30px;
  border: 1px solid black;
  outline: none;
  background-image: none;
  appearance: none;
  background-color: transparent;
  box-shadow: none;

  display: flex;
  flex: 1 1 100%;
`;
