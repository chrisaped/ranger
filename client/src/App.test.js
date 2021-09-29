import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const positionsText = screen.getByText(/Search/i);
  expect(positionsText).toBeInTheDocument();
});
