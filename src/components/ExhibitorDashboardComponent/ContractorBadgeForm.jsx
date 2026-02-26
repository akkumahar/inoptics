import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./ContractorBadgeForm.css";

const ContractorBadgeForm = ({ exhibitorCompany }) => {
  const [contractorCompany, setContractorCompany] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasUnlockedBadge, setHasUnlockedBadge] = useState(false);

  /* ================= FETCH FUNCTION ================= */
  const fetchBadgeData = async () => {
    try {
      const res = await fetch(
        `https://inoptics.in/api/get_contractor_badge.php?exhibitor_company_name=${encodeURIComponent(
          exhibitorCompany
        )}`
      );

      const data = await res.json();

      if (data.success && data.data) {
        const badge = data.data;

        setContractorCompany(badge.contractor_company_name || "");
        setQuantity(badge.badge_quantity || "");
        setIsSubmitted(true);

        setHasUnlockedBadge(Number(badge.is_locked) !== 1);
      } else {
        setContractorCompany("");
        setQuantity("");
        setIsSubmitted(false);
        setHasUnlockedBadge(true);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("Failed to fetch badge data");
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
            : "Badge submitted & locked successfully"
        );

        setIsSubmitted(true);
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
        "https://inoptics.in/api/unlock_contractor_badge.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exhibitor_company_name: exhibitorCompany,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Badge unlocked successfully");
        setHasUnlockedBadge(true);
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
      <h2>Contractor Badge Request</h2>

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

        {hasUnlockedBadge ? (
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
        ) : (
          <button className="unlock-btn" onClick={handleUnlock}>
            Unlock
          </button>
        )}
      </div>
    </div>
  );
};

export default ContractorBadgeForm;