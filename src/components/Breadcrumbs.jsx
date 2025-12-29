// Breadcrumbs.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Breadcrumbs.css";

const breadcrumbMap = {
  // Visitor Guide
  "visitor-guide": ["Visitor Guide"],
  "metro-map": ["Visitor Guide", "Metro Map"],
  "weather": ["Visitor Guide", "Weather Info"],
  "tourist-spots": ["Visitor Guide", "Tourist Spots"],
  "exhibitor-list": ["Visitor Guide", "Exhibitor List"],

  // For Exhibitors (children only — root handled below)
  "for-exhibitors": [],
  "exhibitor-exhibition-map": ["Exhibition Map"],
  "why-exhibit": ["Why Exhibit"],
  "become-exhibitor": ["Become An Exhibitor"],
  "rules-policy": ["Rules & Policy"],

  // Press
  "press": ["Press"],
  "press-release": ["Press Release"],
  "media-gallery": ["Media Gallery"],

  // Others
  "about": ["About Us"],
  "contact": ["Contact Us"],
  "login": ["EXHIBITOR PERSONAL AREA"],
  "privacy-policy": ["Privacy Policy"],
  "terms": ["Terms & Conditions"],
  "benefactors": ["Our Partners"],
  "reach-venue": ["How To Reach Venue"], // default child (will be used/overridden)
};

const titleToPath = {
  "Visitor Guide": "/visitor-guide",
  "FOR EXHIBITORS": "/for-exhibitors",
  "Press": "/press",
};

const exhibitorPages = new Set([
  "for-exhibitors",
  "exhibitor-exhibition-map",
  "why-exhibit",
  "become-exhibitor",
  "rules-policy",
]);

const Breadcrumbs = () => {
  const location = useLocation();
  const pathname = location.pathname || "";
  const currentPage = pathname.split("/").filter(Boolean).pop() || "";

  // Query params (so flag survives refresh / new tab)
  const queryParams = new URLSearchParams(location.search);
  const fromQuery = queryParams.get("from");

  // state (works for in-app navigation but not after refresh)
  const state = location.state || {};

  // Decide source: prefer explicit exhibitor indicators in either state or query
  const isFromExhibitor =
    Boolean(state?.fromExhibitor) ||
    state?.from === "exhibitor" ||
    fromQuery === "exhibitor" ||
    fromQuery === "for-exhibitors";

  const isFromMain =
    state?.from === "main-navbar" || fromQuery === "main-navbar" || fromQuery === "visitor";

  // derive crumb trail from map (child items only for exhibitor pages)
  let crumbTrail = breadcrumbMap[currentPage] || [];

  // Special handling for reach-venue — decide root by where it came from
  if (currentPage === "reach-venue") {
    // we always want the child to read "How To Reach Venue"
    crumbTrail = ["How To Reach Venue"];
    // root link will be chosen below based on isFromExhibitor/isExhibitorPage
  }

  // Decide whether root should be FOR EXHIBITORS or Home
  // If page itself is an exhibitor page OR user came from exhibitor, treat root as exhibitor
  const rootIsExhibitor = isFromExhibitor || exhibitorPages.has(currentPage);

  return (
    <nav className="breadcrumbs">
      {/* Root link */}
      {rootIsExhibitor ? (
        <Link to="/for-exhibitors" className="breadcrumb-link">
          FOR EXHIBITORS
        </Link>
      ) : (
        <Link to="/home" className="breadcrumb-link">
          Home
        </Link>
      )}

      {/* Child crumbs (if any) */}
      {crumbTrail && crumbTrail.length > 0 && crumbTrail.map((crumb, index) => (
        <span key={index}>
          <span className="separator"> › </span>
          {index === crumbTrail.length - 1 ? (
            <span className="current">{crumb}</span>
          ) : (
            <Link to={titleToPath[crumb] || "#"} className="breadcrumb-link">
              {crumb}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
