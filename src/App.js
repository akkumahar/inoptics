import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar";
import ExhibitorNavbar from "./components/ExhibitorNavbar";
import LandingPageWrapper from "./components/LandingPageWrapper";
import HomePageWrapper from "./components/HomePageWrapper";
import AboutUs from "./components/AboutUs";
import MetroMap from "./components/MetroMap";
import ExhibitionMap from "./components/ExhibitionMap";
import WeatherInfo from "./components/WeatherInfo";
import TouristSpots from "./components/TouristSpots";
import WhyExhibit from "./components/WhyExhibit";
import BecomeExhibitor from "./components/BecomeExhibitor";
import RulesPolicy from "./components/RulesPolicy";
import ExhibitorList from "./components/ExhibitorList";
import PressRelease from "./components/PressRelease";
import MediaGallery from "./components/MediaGallery";
import AboutCEP from "./components/AboutCEP";
import Topics from "./components/Topics";
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
import AdminBadges from "./components/List/AdminBadges";
import AdminOnePanel from "./components/AdminOnePanel";
import AdminOneLogin from "./components/AdminOneLogin";
import AdminTwoPanel from "./components/AdminTwoPanel";
import AdminTwoLogin from "./components/AdminTwoLogin";


// ================= ROUTES =================

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      {/* 🔥 key removed — fixes slash + remount issue */}
      <Routes location={location}>
        <Route path="/" element={<LandingPageWrapper />} />
        <Route path="/home" element={<HomePageWrapper />} />
        <Route path="/about" element={<AboutUs />} />

        <Route path="/visitor-guide/metro-map" element={<MetroMap />} />
        <Route path="/visitor-guide/exhibition-map" element={<ExhibitionMap />} />
        <Route path="/visitor-guide/weather" element={<WeatherInfo />} />
        <Route path="/visitor-guide/tourist-spots" element={<TouristSpots />} />

        <Route path="/exhibitor-login" element={<ExhibitorLogin />} />
        <Route path="/why-exhibit" element={<WhyExhibit />} />
        <Route path="/become-exhibitor" element={<BecomeExhibitor />} />
        <Route path="/rules-policy" element={<RulesPolicy />} />
        <Route path="/visitor-guide/exhibitor-list" element={<ExhibitorList />} />

        <Route path="/press/press-release" element={<PressRelease />} />
        <Route path="/press/media-gallery" element={<MediaGallery />} />

        <Route path="/about-cep" element={<AboutCEP />} />
        <Route path="/topics" element={<Topics />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/increase-visibility" element={<IncreaseVisibility />} />

        <Route path="/admin-login" element={<Login />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/exhibitor-dashboard" element={<ExhibitorDashboard />} />

        <Route path="/custom-editor" element={<CustomEditor />} />
        <Route path="/visitor-guide" element={<VisitorGuide />} />
        <Route path="/for-exhibitors" element={<ForExhibitors />} />
        <Route path="/press" element={<Press />} />
        <Route path="/reach-venue" element={<TravelInfo />} />

        <Route path="/exhibitor-exhibition-map" element={<ExhibitorExhibitionMap />} />
        <Route path="/unsubscribe" element={<UnSubscribe />} />
        <Route path="/benefactors" element={<Benefactors />} />
        <Route path="/exhibit-badges" element={<AdminBadges />} />
        <Route path="/sachin" element={<AdminOneLogin />} />
        <Route path="/sachin-dashboard" element={<AdminOnePanel />} />
        <Route path="/exhibitor-badges-printing" element={<AdminTwoLogin />} />
        <Route path="/exhibitor-badges-dashboard" element={<AdminTwoPanel />} />
      </Routes>
    </AnimatePresence>
  );
};


// ================= NAVBAR + LAYOUT LOGIC =================

const NavbarAndRoutes = () => {
  const location = useLocation();

  // 🔥 normalize trailing slash
  const path = location.pathname.replace(/\/+$/, "") || "/";

const hideNavbarRoutes = [
  "/",
  "/dashboard",
  "/exhibitor-dashboard",
  "/exhibitor-login",
  "/unsubscribe",
  "/sachin-dashboard",
  "/sachin",
  "/exhibitor-badges-dashboard",
  "/exhibitor-badges-printing",
];

 const hideFloatingCardRoutes = [
  "/",
  "/dashboard",
  "/exhibitor-dashboard",
  "/exhibitor-login",
  "/unsubscribe",
  "/admin-login",
  "/sachin-dashboard",
  "/sachin",
  "/exhibitor-badges-dashboard",
  "/exhibitor-badges-printing"
];

  const exhibitorRoutes = [
    "/for-exhibitors",
    "/why-exhibit",
    "/become-exhibitor",
    "/rules-policy",
    "/increase-visibility",
    "/exhibitor-login",
    "/exhibitor-exhibition-map",
  ];

  const showNavbar = !hideNavbarRoutes.includes(path);
  const showFloatingCard = !hideFloatingCardRoutes.includes(path);

  let isExhibitorRoute = exhibitorRoutes.includes(path);

  if (path === "/reach-venue") {
    isExhibitorRoute = !!location.state?.fromExhibitor;
  }

  return (
    <>
      {showNavbar && (isExhibitorRoute ? <ExhibitorNavbar /> : <Navbar />)}
      {showFloatingCard && <FloatingCard />}
      <AnimatedRoutes />
    </>
  );
};


// ================= APP ROOT =================

function App() {
  return (
    <Router>
      <NavbarAndRoutes />
      <Toaster position="top-center" reverseOrder={false}
      />
    </Router>
  );
}

export default App;
