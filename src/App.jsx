import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './shared/styles/Variables.scss'

function App() {
  const navigate = useNavigate();

  const match = location.pathname === '/';

  useEffect(() => {
    if (match) {
      navigate('/auction');
    }
  }, [navigate, match]);

  return (
    <div>
      <Outlet/>
    </div>
  );
}

export default App;
