import { createGlobalStyle } from 'styled-components';

import { normalizeCss } from './normalizeCss';

export const GlobalStyle = createGlobalStyle`
  ${normalizeCss};

  html, body {
    font-family: Lucida Console, Courier, monospace;
    color: black;
    font-size: 10px;
  }

  body{
    /* display: flex; */
    position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  flex:1 0 100%;
  align-items: stretch;
  justify-content: stretch;
  flex-direction: row;
  display: flex;
  }

  html {
    box-sizing: border-box;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }
  #root{
    display: flex;
    flex: 1 0 0;
  margin: 0;
  align-items: stretch;
  flex-direction: column;
  }
`;
