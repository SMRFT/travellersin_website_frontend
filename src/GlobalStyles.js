import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #0a0a12;
    color: #fff;
    line-height: 1.6;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`;

export const theme = {
  colors: {
    primary: '#2563eb', // Blue
    secondary: '#10b981', // Green
    dark: '#1e293b',
    light: '#f1f5f9',
    white: '#ffffff',
    danger: '#ef4444',
  },
  breakpoints: {
    mobile: '768px',
  }
};