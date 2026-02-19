import { Routes, Route } from "react-router-dom";
import PharmaGuard from "./Anlysis";
import FamilySection from "./FamilyDetails";
import Home from "./Home";
import RegisterPage from "./Register";
import LoginPage from "./Login";
import LabTechnicianPage from "./Technician";
import ProfilePage from "./Profile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={ <LoginPage /> } />
      <Route path="/register" element={ <RegisterPage /> } />
      <Route path="/profile" element={ <ProfilePage /> } />
      <Route path="/technician" element= { <LabTechnicianPage /> } />
      <Route path="/analysis" element={<PharmaGuard />} />
      <Route path="/family-section" element={<FamilySection /> } />
    </Routes>
  );
}

export default App;