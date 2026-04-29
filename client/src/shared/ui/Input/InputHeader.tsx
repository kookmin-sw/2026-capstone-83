import React from 'react'
import styled from 'styled-components'
import Title from '../Title/Title';
import type { FontSizeKey } from 'shared/types/theme';

interface Props {
  title: string;
  titleSize?: FontSizeKey;
}


const InputHeader = ({ title, titleSize = 'large' }: Props) => {
  return (
    <InputHeaderStyle>
      <Title fontSize={titleSize}>{title}</Title>
      <Divider />
    </InputHeaderStyle>
  )
}

const Divider = styled.hr`
  border: 1px solid ${({ theme }) => theme.color.border};
  margin-top: 20px;
`;

const InputHeaderStyle = styled.div``;

export default InputHeader