import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background-color: #F3EEF1;
    color: #333333;
    line-height: 1.6;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`;

export const theme = {
  colors: {
    primary: '#5a3078', // Orchid Purple
    secondary: '#5a3078', // Orchid Purple
    accent: '#5a3078', // Orchid Purple
    background: '#F3EEF1', // Soft Off-White
    text: '#333333', // Charcoal Grey
    white: '#ffffff',
    danger: '#ef4444',
  },
  breakpoints: {
    mobile: '768px',
  }
};