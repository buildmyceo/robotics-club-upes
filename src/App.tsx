import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import ComingSoon from './ComingSoon';
import Team from './Team';
import NotFound from './NotFound';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/help" element={<ComingSoon />} />
        <Route path="/event" element={<ComingSoon />} />
        <Route path="/team" element={<Team />} />
        <Route path="/register" element={<ComingSoon />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
