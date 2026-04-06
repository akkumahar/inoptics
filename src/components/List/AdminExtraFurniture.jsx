import React, { useState } from "react";

const AdminExtraFurniture = ({
  furnitureData = [],
  formData = {},
  furnitureBilling = {},
  furnitureVendorDetails = [],
  showExhibitorEditForm = false,
  lockState = {},
  isSendingMail = false,

  // functions (props)
  handleQuantityChange,
  addExhibitorSelectedFurniture,
  updateSelectedFurniture,
  handleAdminUnlock,
  handleSendFurnitureMail,
}) => {
  const [showFurnitureList, setShowFurnitureList] = useState(false);
  const [selectedFurniture, setSelectedFurniture] = useState([]);

  return (
    <>
      {/* ================= MODAL ================= */}
      {showFurnitureList && (
        <div className="exhibitor-extra-furniture-modal-overlay">
          <div className="exhibitor-extra-furniture-modal-content-table">
            <div className="exhibitor-extra-furniture-modal-header">
              <h2>Furniture List</h2>
              <button onClick={() => setShowFurnitureList(false)}>×</button>
            </div>

            <div className="exhibitor-extra-furniture-scrollable-body">
              <div className="exhibitor-extra-furniture-grid">
                {furnitureData.map((item) => (
                  <div key={item.id} className="furniture-card">
                    <img
                      src={`https://www.inoptics.in/api/uploads/${item.image}`}
                      alt={item.name}
                      className="furniture-card-img"
                    />
                    <div>{item.name}</div>
                    <div>₹{item.price}</div>

                    {selectedFurniture.find((f) => f.id === item.id) ? (
                      <button disabled style={{ background: "#4caf50" }}>
                        Selected
                      </button>
                    ) : (
                      <button
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
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN SECTION ================= */}
      <div style={{ display: "flex", gap: "40px" }}>
        {/* ================= TABLE ================= */}
        <div className="selected-furniture-table-wrapper">
          <table className="selected-furniture-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {selectedFurniture.length > 0 ? (
                selectedFurniture.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>

                    <td>
                      <img
                        src={`https://www.inoptics.in/api/uploads/${item.image}`}
                        width="80"
                      />
                    </td>

                    <td>{item.name}</td>
                    <td>₹{item.price}</td>

                    <td>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(index, e.target.value)
                        }
                      />
                    </td>

                    <td>₹{item.quantity * item.price}</td>

                    <td>
                      <button
                        onClick={() =>
                          setSelectedFurniture(
                            selectedFurniture.filter((_, i) => i !== index)
                          )
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No furniture selected
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ================= BILLING ================= */}
        <div style={{ width: "30%" }}>
          <button onClick={() => setShowFurnitureList(true)}>
            Add Furniture
          </button>

          <button
            onClick={() => {
              const companyName =
                formData.company_name || "Unknown Company";

              const payload = {
                company_name: companyName,
                furniture: selectedFurniture.map((item) => ({
                  name: item.name,
                  price: item.price,
                  quantity: item.quantity,
                  total: item.quantity * item.price,
                })),
              };

              addExhibitorSelectedFurniture(payload);

              updateSelectedFurniture(companyName, selectedFurniture)
                .then(() => setSelectedFurniture([]))
                .catch(console.error);
            }}
          >
            {showExhibitorEditForm ? "Update" : "Submit"}
          </button>

          {lockState?.is_locked === 1 && (
            <button onClick={() => handleAdminUnlock(formData.company_name)}>
              Unlock
            </button>
          )}

          {/* ===== TOTAL ===== */}
          <h3>Billing</h3>

          <p>Total: ₹{furnitureBilling.amount || 0}</p>

          {formData.state?.toLowerCase() === "delhi" ? (
            <>
              <p>CGST: ₹{furnitureBilling.cgst || 0}</p>
              <p>SGST: ₹{furnitureBilling.sgst || 0}</p>
            </>
          ) : (
            <p>IGST: ₹{furnitureBilling.igst || 0}</p>
          )}

          <h4>Grand Total: ₹{furnitureBilling.grandTotal || 0}</h4>

          {/* ===== VENDOR ===== */}
          <div>
            {furnitureVendorDetails.length > 0 ? (
              furnitureVendorDetails.map((v) => (
                <div key={v.id}>
                  <p>{v.vendor_name}</p>
                  <p>{v.company_name}</p>
                  <p>{v.email}</p>
                  <p>{v.contact_number}</p>
                </div>
              ))
            ) : (
              <p>No vendors</p>
            )}
          </div>

          {/* ===== MAIL ===== */}
          <button
            onClick={() =>
              handleSendFurnitureMail(
                "InOptics 2026 @ Extra Furniture Request Confirmation"
              )
            }
            disabled={isSendingMail}
          >
            {isSendingMail ? "Sending..." : "Send Mail"}
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminExtraFurniture;