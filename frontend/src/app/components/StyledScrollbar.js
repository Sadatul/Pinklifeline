import styled from 'styled-components';

const ScrollableContainer = styled.div`
  overflow-x: auto;

  /* Customizing the scrollbar */
  &::-webkit-scrollbar {
    height: 6px; /* Adjust the height of the horizontal scrollbar */
  }

  &::-webkit-scrollbar-thumb {
    background: #888; /* Color of the scrollbar thumb */
    border-radius: 10px; /* Rounded corners */
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555; /* Color when hovering over the scrollbar thumb */
  }

  &::-webkit-scrollbar-button {
    display: none; /* Remove the end buttons */
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1; /* Color of the scrollbar track */
  }
`;

export default ScrollableContainer;
