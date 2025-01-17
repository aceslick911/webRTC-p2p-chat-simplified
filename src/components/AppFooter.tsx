import React, { FC } from 'react';
import styled from 'styled-components';

const Homepage = styled.div`
  text-decoration: none;
`;
const HomepageLink = styled.a`
  text-decoration: none;
  color: white;
`;
const Version = styled.div``;
const Line = styled.div`
  height: 1px;
  background-color: white;
`;
const InnerContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: black;
  color: white;
  font-size: 8px;
  padding: 5px 8px 4px;
`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: black;
  border: 1px solid black;
  border-top: none;
`;

interface Props {
  version: string;
  homepage: string;
}

export const AppFooter: FC<Props> = ({ version, homepage }) => (
  <Container>
    <Line />
    <InnerContainer>
      <Version>{version}</Version>
      <Homepage>
        <HomepageLink href={`http://${homepage}`}>{homepage}</HomepageLink>
      </Homepage>
    </InnerContainer>
  </Container>
);
