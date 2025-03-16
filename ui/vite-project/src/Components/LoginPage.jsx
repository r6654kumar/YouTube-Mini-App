const Login = () => {
    const handleLogin = () => {
      // Redirects to backend /auth which starts OAuth flow
      window.location.href = 'http://localhost:5000/auth';
    };
  
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>YouTube Mini App</h2>
        <button onClick={handleLogin}>Login with Google</button>
      </div>
    );
  };
  
  export default Login;