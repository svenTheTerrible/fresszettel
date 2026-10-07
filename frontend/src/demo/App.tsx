import { BrowserRouter } from 'react-router';
import { Fresszettel } from './Fresszettel.tsx';
import { AuthProvider } from './AuthProvider';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Fresszettel />
      </AuthProvider>
    </BrowserRouter>
  );
}
