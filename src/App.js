import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import ExhibitorNavbar from "./components/ExhibitorNavbar";
import LandingPageWrapper from "./components/LandingPageWrapper";
import HomePageWrapper from "./components/HomePageWrapper";
import AboutUs from "./components/AboutUs";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Terms from "./components/Terms";
import MetroMap from "./components/MetroMap";
import ExhibitionMap from "./components/ExhibitionMap";
import WeatherInfo from "./components/WeatherInfo";
import TouristSpots from "./components/TouristSpots";
import Footer from "./components/Footer";
import WhyExhibit from "./components/WhyExhibit";
import BecomeExhibitor from "./components/BecomeExhibitor";
import RulesPolicy from "./components/RulesPolicy";
import ExhibitorList from "./components/ExhibitorList";
import PressRelease from "./components/PressRelease";
import MediaGallery from "./components/MediaGallery";
import AboutCEP from "./components/AboutCEP";
import Topics from "./components/Topics";
// import Faculty from './components/Faculty';
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import IncreaseVisibility from "./components/IncreaseVisibility";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import FloatingCard from "./components/FloatingCard";
import ExhibitorDashboard from "./components/ExhibitorDashboard";
import ExhibitorLogin from "./components/ExhibitorLogin";
import CustomEditor from "./components/CustomEditor";
import VisitorGuide from "./components/VisitorGuide";
import ForExhibitors from "./components/ForExhibitors";
import Press from "./components/Press";
import TravelInfo from "./components/TravelInfo";
import ExhibitorExhibitionMap from "./components/ExhibitorExhibitionMap";
import UnSubscribe from "./components/UnSubscribe";
import Benefactors from "./components/Benefactors";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPageWrapper />} />
        <Route path="/home" element={<HomePageWrapper />} />
        <Route path="/about" element={<AboutUs />} />
        {/* <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} /> */}
        <Route path="/visitor-guide/metro-map" element={<MetroMap />} />
        <Route
          path="/visitor-guide/exhibition-map"
          element={<ExhibitionMap />}
        />
        <Route path="/visitor-guide/weather" element={<WeatherInfo />} />
        <Route path="/visitor-guide/tourist-spots" element={<TouristSpots />} />
        <Route path="/exhibitor-login" element={<ExhibitorLogin />} />
        <Route path="/why-exhibit" element={<WhyExhibit />} />
        <Route path="/become-exhibitor" element={<BecomeExhibitor />} />
        <Route path="/rules-policy" element={<RulesPolicy />} />
        <Route
          path="/visitor-guide/exhibitor-list"
          element={<ExhibitorList />}
        />
        <Route path="/press/press-release" element={<PressRelease />} />
        <Route path="/press/media-gallery" element={<MediaGallery />} />
        <Route path="/about-cep" element={<AboutCEP />} />
        <Route path="/topics" element={<Topics />} />
        {/* <Route path="/faculty" element={<Faculty />} /> */}
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/increase-visibility" element={<IncreaseVisibility />} />
        <Route path="/admin-login" element={<Login />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/exhibitor-dashboard" element={<ExhibitorDashboard />} />
        {/* <Route path="/custom-editor" element={<CustomEditor />} /> */}
        <Route path="/custom-editor" element={<CustomEditor />} />
        <Route path="/visitor-guide" element={<VisitorGuide />} />
        <Route path="/for-exhibitors" element={<ForExhibitors />} />
        <Route path="/press" element={<Press />} />
        <Route path="/reach-venue" element={<TravelInfo />} />
        <Route
          path="/exhibitor-exhibition-map"
          element={<ExhibitorExhibitionMap />}
        />
        <Route path="/unsubscribe" element={<UnSubscribe />} />
        <Route path="/benefactors" element={<Benefactors />} />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <NavbarAndRoutes />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
      />
    </Router>
  );
}

const NavbarAndRoutes = () => {
  const location = useLocation();
  const path = location.pathname;

  // Routes where FloatingCard should be hidden
  const hideFloatingCardRoutes = [
    "/",
    "/dashboard",
    "/exhibitor-dashboard",
    "/exhibitor-login",
    "/unsubscribe",
    "/admin-login",
  ];

  // Routes where Navbar should be hidden
  const hideNavbarRoutes = [
    "/",
    "/dashboard",
    "/exhibitor-dashboard",
    "/exhibitor-login",
    "/unsubscribe",
  ];

  const exhibitorRoutes = [
    "/for-exhibitors",
    "/why-exhibit",
    "/become-exhibitor",
    "/rules-policy",
    "/increase-visibility",
    "/exhibitor-login",
    // '/travel-info',
    "/exhibitor-exhibition-map",
  ];

  const showNavbar = !hideNavbarRoutes.includes(path);
  const showFloatingCard = !hideFloatingCardRoutes.includes(path);

  let isExhibitorRoute = exhibitorRoutes.includes(path);

  if (path === "/reach-venue") {
    if (location.state?.fromExhibitor) {
      isExhibitorRoute = true; // Show ExhibitorNavbar
    } else {
      isExhibitorRoute = false; // Show Main Navbar
    }
  }

  return (
    <>
      {showNavbar && (isExhibitorRoute ? <ExhibitorNavbar /> : <Navbar />)}
      <div style={{ position: "relative", overflow: "hidden" }}></div>
      {showFloatingCard && <FloatingCard />}
      <AnimatedRoutes />
    </>
  );
};

export default App;
