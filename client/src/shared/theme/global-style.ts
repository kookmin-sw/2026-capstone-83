import { createGlobalStyle } from 'styled-components';



const GlobalStyle = createGlobalStyle`

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    color: black;
  }

  html, body {
    background-color: white;
    font-family: 'Inter', sans-serif;


    @media ${({ theme }) => theme.mediaQuery.tablet} {
      font-size: 14px;
    }

    @media ${({ theme }) => theme.mediaQuery.mobile} {
      font-size: 12px;
    }
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    border: none;
    cursor: pointer;
    background: none;
  }



`;

export default GlobalStyle;
