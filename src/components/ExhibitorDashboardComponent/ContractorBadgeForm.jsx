import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./ContractorBadgeForm.css";

const ContractorBadgeForm = ({
  exhibitorCompany,
  setContractorViewStep,
  setActiveMenu,
  setCurrentStep,
}) => {
  const [contractorCompany, setContractorCompany] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasUnlockedBadge, setHasUnlockedBadge] = useState(false);
  const [lockStatus, setLockStatus] = useState(0);

  /* ================= FETCH FUNCTION ================= */
  const fetchBadgeData = async () => {
  if (!exhibitorCompany?.trim()) return;

  try {
    const res = await fetch(
      `https://inoptics.in/api/get_contractor_badge.php?exhibitor_company_name=${encodeURIComponent(
        exhibitorCompany
      )}`
    );

    const data = await res.json();

    console.log("Badge API Response:", data);

    if (!data.success) {
      setContractorCompany("");
      setQuantity("");
      setIsSubmitted(false);
      setLockStatus(0);
      setHasUnlockedBadge(true);
      return;
    }

    const badge = data.data || data;

    setContractorCompany(badge.contractor_company_name || "");
    setQuantity(badge.badge_quantity || "");
    setIsSubmitted(true);

    const status = Number(badge.is_locked ?? 0);

    setLockStatus(status);
    setHasUnlockedBadge(status === 0);

  } catch (err) {
    console.error("Fetch error:", err);
  }
};

  useEffect(() => {
    if (exhibitorCompany) {
      fetchBadgeData();
    }
  }, [exhibitorCompany]);

  /* ================= SUBMIT FUNCTION ================= */
  const handleSubmit = async () => {
    if (!contractorCompany || !quantity) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        exhibitor_company_name: exhibitorCompany,
        contractor_company_name: contractorCompany,
        badge_quantity: Number(quantity),
      };

      const apiUrl = isSubmitted
        ? "https://inoptics.in/api/update_contractor_badge.php"
        : "https://inoptics.in/api/add_contractor_badge.php";

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(
          isSubmitted
            ? "Badge updated & locked successfully"
            : "Badge submitted & locked successfully",
        );

        setIsSubmitted(true);
        setLockStatus(1); // Locked
        setHasUnlockedBadge(false);
        fetchBadgeData();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (err) {
      console.error("Submit error:", err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    try {
      const res = await fetch(
        "https://inoptics.in/api/unlock_request_badge.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exhibitor_company_name: exhibitorCompany,
          }),
        },
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Unlock request sent to admin");
        setLockStatus(2); // Requested
        setHasUnlockedBadge(false);
        fetchBadgeData();
      } else {
        toast.error("Unlock failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  return (
    <div className="badge-card">
      <div className="badge-header">
        <button
          className="go-contractor-btn"
          onClick={() => {
            setActiveMenu("Mandatory Forms");

            // 👇 ek step peeche jao (Badge se Undertaking pe)
            setCurrentStep(2);
            setContractorViewStep(2);
          }}
        >
          ← Back
        </button>

        <h2>Contractor Badge Request</h2>

        <button
          className="go-contractor-btn"
          onClick={() => {
            setActiveMenu("Mandatory Forms");

            // 🔥 Go directly to Upload Booth Design
            setCurrentStep(4);
            setContractorViewStep(4);
          }}
        >
          Go to Contractor Page →
        </button>
      </div>

      <div className="badge-form">
        <div className="form-group">
          <label>Exhibitor Company Name</label>
          <input type="text" value={exhibitorCompany} disabled />
        </div>

        <div className="form-group">
          <label>Contractor Company Name</label>
          <input
            type="text"
            value={contractorCompany}
            onChange={(e) => setContractorCompany(e.target.value)}
            disabled={!hasUnlockedBadge}
          />
        </div>

        <div className="form-group">
          <label>Badge Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={!hasUnlockedBadge}
          />
        </div>

        {/* ===== BUTTON LOGIC ===== */}

        {lockStatus === 0 && (
          <button
            className="primary-btn"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : isSubmitted
                ? "Update & Lock"
                : "Submit & Lock"}
          </button>
        )}

        {lockStatus === 1 && (
          <button className="unlock-btn" onClick={handleUnlock}>
            Request Unlock
          </button>
        )}

        {lockStatus === 2 && (
          <button className="unlock-btn pending" disabled>
            Unlock Requested (Waiting for Admin)
          </button>
        )}
      </div>
    </div>
  );
};

export default ContractorBadgeForm;
