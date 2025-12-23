// App.jsx or your router file
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AuthRoutes from './routes/AuthRoutes';


function App() {
  const router = createBrowserRouter([
   
    ...AuthRoutes()
  ]);
  return (
     <RouterProvider router={router} future={{ v7_startTransition: true }}/>
  );
}

export default App;