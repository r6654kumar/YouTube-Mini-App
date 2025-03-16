import { FaGoogle } from 'react-icons/fa';

const Login = () => {
  const handleLogin = () => {
    // Redirects to backend /auth which starts OAuth flow
    window.location.href = 'http://localhost:5000/auth';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">YouTube Mini App</h2>
      <button
        onClick={handleLogin}
        className="flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300"
      >
        <FaGoogle className="mr-2 text-xl" />
        Login with Google
      </button>
    </div>
  );
};

export default Login;
