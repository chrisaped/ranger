import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const positionsText = screen.getByText(/There are no open positions/i);
  expect(positionsText).toBeInTheDocument();
});
