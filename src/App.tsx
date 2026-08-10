import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Team from './Team';
import Event from './Event';
import NotFound from './NotFound';
import Help from './Help';
import Register from './Register';
import Workshop from './Workshop';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/help" element={<Help />} />
        <Route path="/event" element={<Event />} />
        <Route path="/workshop" element={<Workshop />} />
        <Route path="/team" element={<Team />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
