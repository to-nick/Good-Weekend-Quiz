import { BrowserRouter, Route, Routes  } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext.jsx";
import './styles/styles.css'


import Home from './pages/Home.jsx';
import Leaderboard from './pages/Leaderboard.jsx';
import Profile from './pages/Profile.jsx';
import Register from './pages/Register.jsx';
import Submit from './pages/Submit.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';


function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/submit" element={<Submit />} />
              <Route path="/Leaderboard" element={<Leaderboard />} />
            </Routes>
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
