import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useUserContext } from './contexts/UserContext'
import Loader from './shared/UI/Loader'

const Protected = () => {
  const { user, isInitialized } = useUserContext()
  console.log(user)

  if (!isInitialized) {
    return <div style={{ height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div>
      <Loader />
    </div></div>;
  }

  return (
    user ? <Outlet /> : <Navigate to={'/admin-logIn'} />
  )
}

export default Protected