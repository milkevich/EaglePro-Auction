import React from 'react';
import CircularProgress from '@mui/joy/CircularProgress';

const Loader = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh', 
    }}>
      <CircularProgress color="neutral" variant="plain" />
    </div>
  );
};

export default Loader;
