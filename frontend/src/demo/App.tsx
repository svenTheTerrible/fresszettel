import { HashRouter } from 'react-router';
import { Fresszettel } from './Fresszettel.tsx';
import { AuthProvider } from './AuthProvider';

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Fresszettel />
      </AuthProvider>
    </HashRouter>
  );
}
