import React, { useState, useEffect } from "react";
import Footer from './Footer';
import './ExhibitorList.css';
import Breadcrumbs from './Breadcrumbs';

const ExhibitorList = () => {
  const alphabet = ['All', '#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlphabet, setSelectedAlphabet] = useState('All');
  const [mergedData, setMergedData] = useState([]);
  const [visibleLabels, setVisibleLabels] = useState([]);
  const [isCardActive, setIsCardActive] = useState(false);
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  // Fetch exhibitor settings (card labels + status)
  useEffect(() => {
    fetch("https://inoptics.in/api/get_exhibitor_card_settings.php")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.status?.toLowerCase() === "active") {
  setIsCardActive(true);
  setVisibleLabels(data.labels || []);
}
      })
      .catch(err => console.error("Failed to fetch card settings", err));
  }, []);

  // Fetch and merge exhibitor data
useEffect(() => {
  const fetchData = async () => {
    try {
      const [stallsRes, brandsRes, exhibitorsRes] = await Promise.all([
        fetch("https://inoptics.in/api/get_all_stalls.php"),
        fetch("https://inoptics.in/api/get_all_exhibitor_brands.php"),
        fetch("https://inoptics.in/api/get_exhibitors.php")
      ]);

      const stalls = await stallsRes.json();
      const brands = await brandsRes.json();
      const exhibitors = await exhibitorsRes.json();

      // Create lookup maps
      const brandMap = {};
      (Array.isArray(brands.data) ? brands.data : []).forEach(b => {
        brandMap[b.Company_name] = b;
      });

      const exhibitorMap = {};
      (Array.isArray(exhibitors) ? exhibitors : []).forEach(e => {
        exhibitorMap[e.company_name] = e;
      });

      // Merge all data by company_name
      const merged = stalls.map(s => {
        const companyName = s.company_name || "N/A";
        const brandInfo = brandMap[companyName] || {};
        const exhibitorInfo = exhibitorMap[companyName] || {};

        return {
          stallNo: s.stall_number || "N/A",
          stallCategory: s.stall_category || "N/A",
          companyName,
          homeBrands: brandInfo.Home_brands || "",
          distributingBrands: brandInfo.Distributors || "",
          internationalBrands: brandInfo.International_brands || "",
          website: brandInfo.Website || "",

          // From get_exhibitors.php
          name: exhibitorInfo.name || "",
          city: exhibitorInfo.city || "",
          state: exhibitorInfo.state || "",
          pincode: exhibitorInfo.pin || ""
        };
      });

       // Sort by numeric stall number (if it's numeric)
        const sortedMerged = merged.sort((a, b) => {
          const numA = parseInt(a.stallNo);
          const numB = parseInt(b.stallNo);
          return isNaN(numA) || isNaN(numB)
            ? a.stallNo.localeCompare(b.stallNo)
            : numA - numB;
        });

    
        setMergedData(sortedMerged);
      } catch (err) {
        console.error("Failed to fetch exhibitor data:", err);
      }
    };
  fetchData();
}, []);

  const handleSort = (field) => {
    const newOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newOrder);
  };

  const toggleSortOrder = () => {
  setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
};

  let filteredData = [...mergedData];

  if (selectedAlphabet !== "All") {
    filteredData = filteredData.filter(ex =>
      selectedAlphabet === "#" ? /^[^A-Za-z]/.test(ex.companyName) :
        ex.companyName.toUpperCase().startsWith(selectedAlphabet)
    );
  }

  if (searchQuery.trim() !== "") {
    const query = searchQuery.toLowerCase();
    filteredData = filteredData.filter(ex =>
      ex.companyName.toLowerCase().includes(query)
    );
  }

    if (sortField) {
    filteredData.sort((a, b) => {
      const valA = a[sortField]?.toLowerCase?.() || "";
      const valB = b[sortField]?.toLowerCase?.() || "";
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const isAlphabetFilterActive = selectedAlphabet !== "All";
  const currentEntries = isAlphabetFilterActive
    ? filteredData
    : filteredData.slice(
        (currentPage - 1) * entriesPerPage,
        currentPage * entriesPerPage
      );
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  const handleSearchChange = e => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleAlphabetClick = char => {
    setSelectedAlphabet(char);
    setCurrentPage(1);
  };

  const handleEntriesChange = e => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = pageNumber => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="main-content-wrapper">
      <div className="Exelist-main-container">
        <Breadcrumbs />
        <h1 className="Exelist-heading">Exhibitor List</h1>

         <div className="controls-bar">
          
          <div className="search-box">
            <label htmlFor="search-input">Search:</label>
            <input
              type="text"
              id="search-input"
              className="search-input"
              placeholder="Search exhibitors..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="sort-controls" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
  <strong>Sort by:</strong>
  <select
    onChange={(e) => handleSort(e.target.value)}
    value={sortField}
    className="sort-dropdown"
  >
    <option value="">-- Select --</option>
    <option value="companyName">Company Name</option>
    <option value="name">Name</option>
    <option value="state">State</option>
    <option value="city">City</option>
    <option value="stallNo">Stall No</option>
  </select>

  {/* Optional: Asc/Desc Toggle Button */}
  <button onClick={toggleSortOrder} className="sort-toggle-btn">
    {sortOrder === "asc" ? "▲ ASC" : "▼ DESC"}
  </button>
</div>
        </div>

        <div className="alphabet-bar">
          {alphabet.map(char => (
            <button
              key={char}
              className={`alphabet-button ${selectedAlphabet === char ? 'active' : ''}`}
              onClick={() => handleAlphabetClick(char)}
            >
              {char}
            </button>
          ))}
        </div>

      
    

        {/* Card View */}
        {isCardActive ? (
          <div className="exhibitor-card-grid">
         {currentEntries.map((ex, index) => (
  <div className="homepage-card" key={index}>
    <div className="card-top">
      {visibleLabels.includes("STALL NO") && <span>{ex.stallNo}</span>}
      {visibleLabels.includes("STALL NO") && visibleLabels.includes("STALL CATEGORY") && (
        <span className="separator">||</span>
      )}
      {visibleLabels.includes("STALL CATEGORY") && <span>{ex.stallCategory || "N/A"}</span>}
    </div>

    {visibleLabels.includes("COMPANY NAME") && (
      <h3 className="company-name-card">{ex.companyName}</h3>
    )}

    <hr className="card-divider" />

    <div className="card-details">
      {visibleLabels.includes("NAME") && <p><strong>Name:</strong> {ex.name}</p>}
          {visibleLabels.includes("STATE") && <p><strong>State:</strong> {ex.state}</p>}
          {visibleLabels.includes("CITY") && <p><strong>City:</strong> {ex.city}</p>}
          {visibleLabels.includes("PINCODE") && <p><strong>Pincode:</strong> {ex.pincode}</p>}


{(visibleLabels.includes("HOME BRANDS") ||
  visibleLabels.includes("DISTRIBUTORS OF BRANDS") ||
  visibleLabels.includes("INTERNATIONAL BRANDS")) && (
  <div style={{ marginTop: '10px' }}>
    <strong style={{ fontSize: '14px' }}>Brands On Display:</strong>
    <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>

      {visibleLabels.includes("HOME BRANDS") && ex.homeBrands && (
        <div style={{ flex: 1, textAlign: 'left' }}>
       <strong
  style={{
    fontSize: '12px',
    lineHeight: '1',
    display: 'inline-block',
    maxWidth: '70px',
    // wordBreak: 'break-word',
    whiteSpace: 'normal',
  }}
>
  Home Brands
</strong>
          <div style={{ fontSize: '11px', marginTop: '5px' }}>
            {ex.homeBrands
              .split(",")
              .map(brand => brand.trim())
              .filter(Boolean)
              .join(", ")}
          </div>
        </div>
      )}

      {visibleLabels.includes("DISTRIBUTORS OF BRANDS") && ex.distributingBrands && (
        <div style={{ flex: 1, textAlign: 'left' }}>
          <strong  style={{
    fontSize: '12px',
    lineHeight: '1',
    display: 'inline-block',
    maxWidth: '70px',
    // wordBreak: 'break-word',
    whiteSpace: 'normal',
  }}>Distributors of Brands</strong>
          <div style={{ fontSize: '11px', marginTop: '5px' }}>
            {ex.distributingBrands
              .split(",")
              .map(brand => brand.trim())
              .filter(Boolean)
              .join(", ")}
          </div>
        </div>
      )}

      {visibleLabels.includes("INTERNATIONAL BRANDS") && ex.internationalBrands && (
        <div style={{ flex: 1, textAlign: 'left' }}>
          <strong  style={{
    fontSize: '12px',
    lineHeight: '1',
    display: 'inline-block',
    maxWidth: '70px',
    // wordBreak: 'break-word',
    whiteSpace: 'normal',
  }}>International Brands</strong>
          <div style={{ fontSize: '11px', marginTop: '5px' }}>
            {ex.internationalBrands
              .split(",")
              .map(brand => brand.trim())
              .filter(Boolean)
              .join(", ")}
          </div>
        </div>
      )}

    </div>
  </div>
)}


      {visibleLabels.includes("WEBSITE") && (
        <p>
          <a href={ex.website} target="_blank" rel="noreferrer">
            {ex.website}
          </a>
        </p>
      )}
    </div>
  </div>
))}

          </div>
        ) : (
          <p className="card-inactive-msg">Exhibitor cards Comming Soon..</p>
        )}

        {!isAlphabetFilterActive && totalPages > 1 && (
          <div className="pagination">
            <span>Page: </span>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            {currentPage < totalPages && (
              <button onClick={() => handlePageChange(currentPage + 1)}>Next</button>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ExhibitorList;
