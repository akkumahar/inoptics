import React from "react";

import "./ExhibitorFurnitureRequirements.css";
import { FaTrashAlt } from "react-icons/fa";

const FurnitureRequirements = ({
  furnitureData,
  selectedFurniture,
  setSelectedFurniture,
  showFurnitureList,
  setShowFurnitureList,
  isFurnitureSaved,
  setIsFurnitureSaved,
  handleQuantityChange,
  updateSelectedFurniture,
  handleSendFurnitureMail,
  handleUnlockRequestMail,
  furnitureBilling,
  furnitureVendorDetails,
  currentExhibitor,
}) => {
  return (
    <div className="furniture-requirements-container">
      {/* ================= FURNITURE MODAL ================= */}

      {showFurnitureList && (
        <div className="furniture-modal-overlay">
          <div className="furniture-modal-content">
            <div className="furniture-modal-header">
              <h2>Furniture List</h2>
              <button
                className="furniture-modal-close-btn"
                onClick={() => setShowFurnitureList(false)}
              >
                ×
              </button>
            </div>

            <div className="furniture-modal-body">
              <div className="furniture-grid">
                {furnitureData.length === 0 ? (
                  <p>No furniture available.</p>
                ) : (
                  furnitureData
                    .sort((a, b) => {
                      const piA = parseInt(a.name.match(/PI-(\d+)/)?.[1] || 0);
                      const piB = parseInt(b.name.match(/PI-(\d+)/)?.[1] || 0);
                      return piA - piB;
                    })
                    .map((item) => {
                      const alreadySelected = selectedFurniture.some(
                        (f) => f.id === item.id,
                      );

                      return (
                        <div className="furniture-card" key={item.id}>
                          <img
                            src={`https://www.inoptics.in/api/uploads/${item.image}`}
                            alt={item.name}
                            className="furniture-card-img"
                          />

                          <div className="furniture-card-name">{item.name}</div>
                          <div className="furniture-card-price">
                            ₹{item.price}
                          </div>

                          {alreadySelected ? (
                            <button className="btn-selected" disabled>
                              Selected
                            </button>
                          ) : (
                            <button
                              className="btn-select"
                              onClick={() =>
                                setSelectedFurniture([
                                  ...selectedFurniture,
                                  { ...item, quantity: 1 },
                                ])
                              }
                            >
                              Select
                            </button>
                          )}
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN LAYOUT ================= */}

      <div className="furniture-main-layout">
        {/* ================= TABLE ================= */}

        <div className="furniture-table-section">
          <h4>Additional Furniture </h4>
          <div className="furniture-table-scroll">
            <table className="furniture-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  {!isFurnitureSaved && <th>Action</th>}
                </tr>
              </thead>

              <tbody>
                {selectedFurniture.length > 0 ? (
                  selectedFurniture.map((item, index) => (
                    <tr key={item.id} className="ft-row">
                      {/* ===== DESKTOP ===== */}
                      <td className="ft-d">{index + 1}</td>

                      <td className="ft-d">
                        <img
                          src={`https://www.inoptics.in/api/uploads/${item.image}`}
                          alt={item.name}
                          className="furniture-table-img"
                        />
                      </td>

                      <td className="ft-d">{item.name}</td>
                      <td className="ft-d">₹{item.price}</td>

                      <td className="ft-d">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity || 1}
                          disabled={isFurnitureSaved}
                          className="furniture-qty-input"
                          onChange={(e) =>
                            handleQuantityChange(index, e.target.value)
                          }
                        />
                      </td>

                      <td className="ft-d">
                        ₹
                        {item.quantity
                          ? (item.quantity * item.price).toFixed(2)
                          : "0.00"}
                      </td>

                      {!isFurnitureSaved && (
                        <td className="ft-d">
                          <button
                            className="btn-delete"
                            onClick={() =>
                              setSelectedFurniture(
                                selectedFurniture.filter((_, i) => i !== index),
                              )
                            }
                          >
                            Delete
                          </button>
                        </td>
                      )}

                      {/* ===== MOBILE CARD ===== */}
                      <td className="ft-m" colSpan={isFurnitureSaved ? 6 : 7}>
                        <div className="ft-card">
                          {/* top badge */}
                          {/* <div className="ft-badge">{index + 1}</div> */}

                          <div className="ft-card-main">
                            {/* image */}
                            <div className="ft-card-body-details-card">
                              <img
                                src={`https://www.inoptics.in/api/uploads/${item.image}`}
                                alt={item.name}
                                className="ft-card-img"
                              />
                              <div>
                                <div className="ft-label">Price</div>
                                <div className="ft-price">₹{item.price}</div>
                              </div>
                            </div>

                            {/* right content */}
                            <div className="ft-card-body">
                              <div className="ft-name">
                                <div className="ft-badge">{index + 1}</div>{" "}
                                {item.name}
                              </div>

                              <div className="ft-qty-wrap">
                                <div className="ft-label">Quantity</div>
                                <div className="ft-qty-box">
                                  <button
                                    onClick={() => {
                                      const newQty = Math.max(
                                        1,
                                        (item.quantity || 1) - 1,
                                      );
                                      handleQuantityChange(index, newQty);
                                    }}
                                   
                                  >
                                    −
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity || 1}
                                    disabled={isFurnitureSaved}
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        index,
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <button
                                    onClick={() => {
                                      const newQty = (item.quantity || 1) + 1;
                                      handleQuantityChange(index, newQty);
                                    }}
                                    
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* bottom total */}
                          <div className="ft-total-row">
                            <span>Total</span>
                            <span>
                              ₹
                              {item.quantity
                                ? (item.quantity * item.price).toFixed(2)
                                : "0.00"}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={isFurnitureSaved ? 6 : 7}
                      className="furniture-empty-msg"
                    >
                      No furniture selected yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= BILLING SECTION ================= */}

        <div className="furniture-billing-section">
          {/* ACTION BUTTONS */}

          <div className="furniture-action-btn furniture-action-btn-group">
            <button
              onClick={() => setShowFurnitureList(true)}
              disabled={isFurnitureSaved}
            >
              Add Furniture
            </button>

            {!isFurnitureSaved ? (
              <button
                onClick={async () => {
                  await updateSelectedFurniture(
                    currentExhibitor?.company_name,
                    selectedFurniture,
                  );
                  await handleSendFurnitureMail(
                    "InOptics 2026 @ Extra Furniture Request Confirmation",
                  );
                  setIsFurnitureSaved(true);
                }}
                style={{ background: "#4caf50", color: "#fff" }}
              >
                Save
              </button>
            ) : (
              <button
                onClick={handleUnlockRequestMail}
                style={{ background: "#ff9800", color: "#fff" }}
              >
                Unlock Request
              </button>
            )}
          </div>

          {/* ================= BILLING DETAILS ================= */}

          <h3>Particulars</h3>

          <div className="furniture-billing-details">
            <div>
              <span>Total</span>
              <span>₹{furnitureBilling.amount?.toFixed(2) || "0.00"}</span>
            </div>

            {currentExhibitor?.state?.toLowerCase() === "delhi" ? (
              <>
                <div>
                  <span>CGST (9%)</span>
                  <span>₹{furnitureBilling.cgst?.toFixed(2) || "0.00"}</span>
                </div>
                <div>
                  <span>SGST (9%)</span>
                  <span>₹{furnitureBilling.sgst?.toFixed(2) || "0.00"}</span>
                </div>
              </>
            ) : (
              <div>
                <span>IGST (18%)</span>
                <span>₹{furnitureBilling.igst?.toFixed(2) || "0.00"}</span>
              </div>
            )}

            <hr />

            <div className="furniture-grand-total">
              <span>GRAND TOTAL</span>
              <span>₹{furnitureBilling.grandTotal?.toFixed(2) || "0.00"}</span>
            </div>
          </div>

          {/* ================= VENDOR INSTRUCTIONS ================= */}

          <div className="instruction-card">
            {furnitureVendorDetails.map((vendor) => {
              const clean = vendor.description
                .replace(/<[^>]+>/g, "")
                .replace(/&amp;/g, "&");

              let parts = clean.split(/(?<=\.)\s*/);

              const rows = [];

              parts.forEach((text) => {
                if (!text.trim()) return;

                // 🔥 split Instructions line
                if (/^instructions:/i.test(text)) {
                  const after = text.split(/instructions:/i)[1];

                  rows.push({ type: "heading", text: "Instructions:" });

                  if (after?.trim()) {
                    rows.push({ type: "li", text: after.trim() });
                  }
                  return;
                }

                // 🔥 split Vendor heading line
                if (/official vendor/i.test(text)) {
                  const [head, rest] = text.split(/official vendor/i);

                  rows.push({
                    type: "heading",
                    text: (head + "OFFICIAL VENDOR").trim(),
                  });

                  if (rest?.trim()) {
                    const vendorParts = rest
                      .split(/(?=Address:|Email:|Phone:)/i) // 👈 magic split
                      .filter((x) => x.trim());

                    vendorParts.forEach((v) =>
                      rows.push({ type: "li", text: v.trim() }),
                    );
                  }

                  return;
                }

                rows.push({ type: "li", text });
              });

              return (
                <div key={vendor.id}>
                  {rows.map((row, i) =>
                    row.type === "heading" ? (
                      <div key={i} className="instruction-big-heading">
                        {row.text}
                      </div>
                    ) : (
                      <li key={i} className="instruction-li">
                        {row.text}
                      </li>
                    ),
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FurnitureRequirements;
