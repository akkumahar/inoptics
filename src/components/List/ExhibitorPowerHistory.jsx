import React, { useEffect, useState } from "react";
import "./ExhibitorPowerHistory.css";

const ExhibitorPowerHistory = () => {
  const [data, setData] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState("");

  // 🔥 Fetch API
  useEffect(() => {
    fetch("https://www.inoptics.in/api/fetch_all_power_history.php")
      .then((res) => res.json())
      .then((res) => {
        if (res.status) {
          setData(res.data);

          // Group by company
          const grouped = {};
          res.data.forEach((item) => {
            if (!grouped[item.company_name]) {
              grouped[item.company_name] = [];
            }
            grouped[item.company_name].push(item);
          });

          setGroupedData(grouped);
        }
      });
  }, []);

  // 🔥 Filter companies by search
  const filteredCompanies = Object.keys(groupedData).filter((company) =>
    company.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="power-history-container">
      {/* 🔍 Search */}
      <div className="top-bar-history">
        <input
          type="text"
          placeholder="Search by company name..."
          className="search-bar-history"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 🔽 Accordion List */}
      <div className="accordion-list">
        {filteredCompanies.map((company, index) => (
          <div key={index} className="accordion-item">
            <div
              className="accordion-header"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <span>{company}</span>
              <span>{openIndex === index ? "▲" : "▼"}</span>
            </div>

            {openIndex === index && (
              <div className="accordion-content">
                <table>
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Price/KW</th>
                      <th>Power</th>
                      <th>Phase</th>
                      <th>Total</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {groupedData[company].map((item) => (
                      <tr key={item.id}>
                        <td>{item.day}</td>
                        <td>{item.price_per_kw}</td>
                        <td>{item.power_required}</td>
                        <td>{item.phase}</td>
                        <td>{item.total_amount}</td>
                        <td>{item.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExhibitorPowerHistory;
