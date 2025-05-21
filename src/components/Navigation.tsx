import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path 
      ? 'text-blue-600 border-b-2 border-blue-600' 
      : 'text-gray-600 hover:text-blue-600 dark:text-gray-300';
  };

  return (
    <nav className="bg-white shadow-sm dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              AI RegEx Generator
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/" className={`px-3 py-2 ${isActive('/')}`}>
              Generator
            </Link>
            <Link to="/library" className={`px-3 py-2 ${isActive('/library')}`}>
              Library
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 