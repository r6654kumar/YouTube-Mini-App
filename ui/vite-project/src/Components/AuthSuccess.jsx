import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h3>Login Successful!</h3>
      <p>Redirecting to Dashboard...</p>
    </div>
  );
};

export default AuthSuccess;
