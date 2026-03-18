import React from "react";
import { FaEdit } from "react-icons/fa";

import "./ExhibitorProfile.css";
const ExhibitorProfile = ({
  exhibitors = [],
  stallList = [],
  brandsData,
  setBrandsData,
  products = [],
  hasBrandsData,
  isEditMode,
  setIsEditMode,
  handleSubmitBrands,
  handleEditBrands,
}) => {
  return (
    <div className="profile-content">
      <div className="profile-layout">
        {/* LEFT SIDE */}
        <div className="profile-left">
          <PersonalDetailsCard exhibitors={exhibitors} />
          <StallDetailsCard stallList={stallList} />
        </div>

        {/* RIGHT SIDE */}
        <div className="profile-right">
          <BrandsCard
            brandsData={brandsData}
            setBrandsData={setBrandsData}
            products={products}
            hasBrandsData={hasBrandsData}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            handleSubmitBrands={handleSubmitBrands}
            handleEditBrands={() => setIsEditMode(true)}
          />
        </div>
      </div>
    </div>
  );
};

export default ExhibitorProfile;

/* ================= PERSONAL DETAILS ================= */

const PersonalDetailsCard = ({ exhibitors }) => (
  <div className="profile-card">
    <div className="profile-section">
      <h3 className="brands-heading">Personal Details</h3>

      {exhibitors.length === 0 ? (
        <p className="profile-empty">No exhibitors found.</p>
      ) : (
        exhibitors.map((ex) => (
          <div key={ex.id} className="profile-details-grid">
            <Detail label="Company Name" value={ex.company_name} />
            <Detail label="Name" value={ex.name} />
            <Detail label="Address" value={ex.address} />
            <Detail label="City" value={ex.city} />
            <Detail label="State" value={ex.state} />
            <Detail label="Pincode" value={ex.pin} />
            <Detail label="Mobile No" value={ex.mobile} />
            <Detail label="Email" value={ex.email} />
            <Detail label="GST" value={ex.gst} />
          </div>
        ))
      )}
    </div>
  </div>
);

/* ================= STALL DETAILS ================= */

const StallDetailsCard = ({ stallList }) => (
  <div className="profile-card">
    <div className="profile-section">
      <h3 className="brands-heading">Stall Details</h3>

      {stallList.length === 0 ? (
        <p className="profile-empty">No stall details found.</p>
      ) : (
        stallList.map((stall, idx) => (
          <div key={idx} className="profile-details-grid">
            <Detail label="Stall Number" value={stall.stall_number} />
            {/* <Detail label="Stall Category" value={stall.stall_category} /> */}
            <Detail
              label="Stall Price"
              value={
                stall.stall_price
                  ? `${stall.currency || stallList?.[0]?.currency || "₹"} ${stall.stall_price}`
                  : null
              }
            />
            <Detail
              label="Stall Area"
              value={stall.stall_area ? `${stall.stall_area} sq. mtr.` : null}
            />
          </div>
        ))
      )}
    </div>
  </div>
);

/* ================= BRANDS CARD ================= */

const BrandsCard = ({
  brandsData,
  setBrandsData,
  products,
  hasBrandsData,
  isEditMode,
  setIsEditMode,
  handleSubmitBrands,
  handleEditBrands,
}) => {
  return (
    <div className="profile-card brands-card-root">
      {/* ================= FORM MODE ================= */}
      {isEditMode && (
        <div className="brands-form slide-up-form brands-form-responsive">
          <h2 className="brands-heading">Brands</h2>

          <div className="brands-input-row brands-grid">
            <Field
              label="Website"
              value={brandsData.website}
              onChange={(v) => setBrandsData((p) => ({ ...p, website: v }))}
            />

            {/* Products */}
            <div className="brands-field-group">
              <label>Products:</label>

              {(brandsData.products || []).map((p, i) => (
                <div key={p + i} className="selected-product">
                  {p}
                  <span
                    className="remove-icon"
                    onClick={() =>
                      setBrandsData((prev) => ({
                        ...prev,
                        products: prev.products.filter((x) => x !== p),
                      }))
                    }
                  >
                    ✖
                  </span>
                </div>
              ))}

              <select
                value=""
                onChange={(e) => {
                  const v = e.target.value;
                  if (v && !(brandsData.products || []).includes(v)) {
                    setBrandsData((p) => ({
                      ...p,
                      products: [...(p.products || []), v],
                    }));
                  }
                }}
              >
                <option value="">-- Select Product --</option>
                {products.map((p, i) => (
                  <option key={i} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <Field
              label="Home Brands"
              value={brandsData.home_brands}
              onChange={(v) => setBrandsData((p) => ({ ...p, home_brands: v }))}
            />

            <Field
              label="Distributors"
              value={brandsData.distributors}
              onChange={(v) =>
                setBrandsData((p) => ({ ...p, distributors: v }))
              }
            />

            <Field
              label="International Brands"
              value={brandsData.international_brands}
              onChange={(v) =>
                setBrandsData((p) => ({
                  ...p,
                  international_brands: v,
                }))
              }
            />
          </div>

          <div className="brands-button-section brands-btn-row">
            <button
              className="brands-details-add-brands-btn"
              onClick={handleSubmitBrands}
            >
              {hasBrandsData ? "Update" : "Submit"}
            </button>

            {hasBrandsData && (
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setIsEditMode(false)}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= VIEW MODE ================= */}
      {!isEditMode && hasBrandsData && (
        <div className="profile-section">
          <div className="brands-view-header">
            <h3 className="brands-heading">Brands</h3>

            <button
              className="brands-edit-btn"
              onClick={handleEditBrands}
              type="button"
            >
              <FaEdit />
            </button>
          </div>

          <div className="profile-details-grid">
            <Detail label="Website" value={brandsData.website} />
            <Detail label="Products" value={brandsData.products.join(", ")} />
            <Detail label="Home Brands" value={brandsData.home_brands} />
            <Detail label="Distributors" value={brandsData.distributors} />
            <Detail
              label="International Brands"
              value={brandsData.international_brands}
            />
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= SMALL REUSABLE UI ================= */

const Detail = ({ label, value }) => (
  <div className="profile-details-row">
    <label>{label}:</label>
    <span>{value || "N/A"}</span>
  </div>
);

const Field = ({ label, value, onChange, full }) => (
  <div className={`brands-field-group ${full ? "brands-full" : ""}`}>
    <label>{label}:</label>
    <input value={value || ""} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const View = ({ label, value, full }) => (
  <div className={full ? "brands-full" : ""}>
    <label>{label}</label>
    <div className="view-box">{value || "—"}</div>
  </div>
);
