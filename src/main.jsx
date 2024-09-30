import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route } from 'react-router-dom';
import App from './App';
import AdminDashboard from './screens/AdminDashboard';
import Protected from './Protected';
import UserContextProvider from './contexts/UserContext';
import Auction from './screens/Auction';
import AdminAuth from './screens/AdminAuth';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<App />}>
      <Route path='/auction' element={<Auction />} />
      <Route path='/admin-login' element={<AdminAuth />} />
      <Route element={<Protected />}>
        <Route path='/admin' element={<AdminDashboard />} />
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserContextProvider>
      <RouterProvider router={router} />
    </UserContextProvider>
  </React.StrictMode>,
);
