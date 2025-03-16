import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

const AuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('isLoggedIn', 'true');
    const timer = setTimeout(() => {
      navigate('/HomePage');
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Login Successful!</h3>
      <div className="flex items-center text-gray-700 text-lg">
        <FaSpinner className="animate-spin mr-2 text-xl text-gray-600" />
        Redirecting to Dashboard...
      </div>
    </div>
  );
};

export default AuthSuccess;
