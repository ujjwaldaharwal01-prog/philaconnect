import About from './pages/About';
import SpinWheel from './pages/SpinWheel';
import Game from './pages/Game';
import Community from './pages/Community';
import CommunityPost from './pages/CommunityPost';
import Communities from './pages/Communities';
import Recommendations from './pages/Recommendations';
import Checkout from './pages/Checkout';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Cart from './pages/Cart';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import PlaceholderPage from './pages/PlaceholderPage';
import NotFoundPage from './pages/NotFoundPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import Quiz from './pages/Quiz';


import { PLACEHOLDER_PAGES } from './constants/site';

/**
 * Route table. Everything renders inside <Layout> (navbar + footer).
 * Routes listed in PLACEHOLDER_PAGES show a "coming soon" page until their feature is built;
 * replace each with the real page component as we go.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/:id" element={<CommunityPost />} />
        <Route path="/communities" element={<Communities />} />
        <Route path="/about" element={<About />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/spin" element={<SpinWheel />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/game" element={<Game />} />
        <Route path="/quiz" element={<Quiz />} />
        {Object.keys(PLACEHOLDER_PAGES).map((path) => (
          <Route key={path} path={path} element={<PlaceholderPage />} />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}