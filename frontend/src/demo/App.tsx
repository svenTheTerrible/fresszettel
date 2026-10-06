import { BrowserRouter } from 'react-router';
import { Demo } from './Demo';
import { AuthProvider } from './AuthProvider';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Demo />
      </AuthProvider>
    </BrowserRouter>
  );
}
