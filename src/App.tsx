import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import RegexLibrary from './components/RegexLibrary';
import Navigation from './components/Navigation';

function App() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/library" element={<RegexLibrary />} />
        </Routes>
      </main>
    </div>
  );
}

export default App; 