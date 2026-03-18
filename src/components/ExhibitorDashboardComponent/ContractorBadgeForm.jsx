import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "./ContractorBadgeForm.css";

const ContractorBadgeForm = ({
  exhibitorCompany,
  setContractorViewStep,
  setActiveMenu,
  setCurrentStep,
  exhibitorData,
}) => {
  const [contractorCompany, setContractorCompany] = useState("");
  const [quantity, setQuantity] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [hasUnlockedBadge, setHasUnlockedBadge] = useState(false);
  const [lockStatus, setLockStatus] = useState(0);

  const [contractorValid, setContractorValid] = useState(null);
  const [checkingContractor, setCheckingContractor] = useState(false);

  const [contractorEmail, setContractorEmail] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const [showEmailSentPopup, setShowEmailSentPopup] = useState(false);

  const [isContractorAutoFilled, setIsContractorAutoFilled] = useState(false);

  const [messageRule, setMessageRule] = useState({
    success_message: "",
    error_message: "",
  });

  /* ================= FETCH BADGE DATA ================= */

  const fetchBadgeData = async () => {
    if (!exhibitorCompany?.trim()) return;

    try {
      const res = await fetch(
        `https://inoptics.in/api/get_contractor_badge.php?exhibitor_company_name=${encodeURIComponent(exhibitorCompany)}`,
      );

      const data = await res.json();

      if (!data.success) {
        setContractorCompany("");
        setQuantity("");
        setIsSubmitted(false);
        setLockStatus(0);
        setHasUnlockedBadge(true);
        return;
      }

      const badge = data.data || data;

      const contractorName = badge.contractor_company_name || "";

      setContractorCompany(contractorName);
      setQuantity(badge.badge_quantity || "");
      setIsSubmitted(true);

      if (contractorName.trim() !== "") {
        setIsContractorAutoFilled(true);
        setContractorValid(true);
      }

      const status = Number(badge.is_locked ?? 0);

      setLockStatus(status);
      setHasUnlockedBadge(status === 0);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    if (exhibitorCompany) fetchBadgeData();
  }, [exhibitorCompany]);

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!contractorCompany || !quantity) {
      toast.error("Please fill all fields");
      return;
    }

    if (contractorValid !== true && !isContractorAutoFilled) {
      toast.error("Contractor must be registered before submitting badge.");
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
        headers: {
          "Content-Type": "application/json",
        },
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
        setLockStatus(1);
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

  /* ================= UNLOCK ================= */

  const handleUnlock = async () => {
  try {
    const exhibitorCompany = exhibitorData?.company_name || "";
    const exhibitorEmail = exhibitorData?.email || "";

    if (!exhibitorCompany) {
      toast.error("Company name missing");
      return;
    }

    /* ================= 1. UNLOCK REQUEST ================= */
    const res = await fetch(
      "https://inoptics.in/api/unlock_request_badge.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          exhibitor_company_name: exhibitorCompany,
        }),
      }
    );

    const data = await res.json();

    if (!data.success) {
      toast.error("Unlock request failed");
      return;
    }

    /* ================= 2. SEND MAIL (NEW API) ================= */
    await fetch(
      "https://inoptics.in/api/send_power_unlocked_mail.php", // 👈 tumhari new API ka URL
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_name: exhibitorCompany,
          email: exhibitorEmail,
          template_name: "InOptics 2026 @ Contractor Badges Unlock Request", // ✅ exact DB name
        }),
      }
    );

    /* ================= SUCCESS ================= */
    toast.success("Unlock request sent to admin");

    setLockStatus(2);
    setHasUnlockedBadge(false);

  } catch (err) {
    console.error(err);
    toast.error("Server error");
  }
};


  /* ================= CHECK CONTRACTOR ================= */

  const checkContractorCompany = async (value) => {
    if (!value.trim()) {
      setContractorValid(null);
      return;
    }

    try {
      setCheckingContractor(true);

      const res = await fetch(
        "https://inoptics.in/api/check_contractor_company.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contractor_company_name: value,
          }),
        },
      );

      const data = await res.json();

      setContractorValid(data.success ? data.matched : false);
    } catch (err) {
      console.error(err);
      setContractorValid(false);
    } finally {
      setCheckingContractor(false);
    }
  };

  /* ================= MESSAGE RULE ================= */

  const fetchMessageRules = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_message_rules.php");

      const data = await res.json();

      if (data.success && data.data?.length) {
        const rule = data.data.find(
          (item) => item.match_value?.toLowerCase() === "contractor badge",
        );

        if (rule) {
          setMessageRule({
            success_message: rule.success_message || "",
            error_message: rule.error_message || "",
          });
        }
      }
    } catch (error) {
      console.error("Message rule fetch error:", error);
    }
  };

  useEffect(() => {
    fetchMessageRules();
  }, []);

  return (
    <div className="badge-card">
      <div className="badge-header">
        <button
          className="go-contractor-btn"
          onClick={() => {
            setActiveMenu("Mandatory Forms");
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
          <label>
            Contractor Company Name
            {checkingContractor && (
              <span className="checking-label"> Checking...</span>
            )}
            {!checkingContractor && contractorValid === true && (
              <span className="match-success">
                {messageRule.success_message}
              </span>
            )}
            {!checkingContractor && contractorValid === false && (
              <span className="match-error">{messageRule.error_message}</span>
            )}
            {isContractorAutoFilled && (
              <span className="auto-filled-label">
                Contractor already assigned
              </span>
            )}
          </label>

          <input
            type="text"
            value={contractorCompany}
            onChange={(e) => {
              const value = e.target.value;
              setContractorCompany(value);
              checkContractorCompany(value);
            }}
            disabled={!hasUnlockedBadge || isContractorAutoFilled}
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

        {lockStatus === 0 && (
          <button
            className="primary-btn"
            onClick={handleSubmit}
            disabled={
              loading ||
              (!isSubmitted &&
                contractorValid !== true &&
                !isContractorAutoFilled)
            }
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

      {showEmailSentPopup && (
        <div className="simple-popup-overlay">
          <div className="simple-popup">
            <p>
              We have sent the contractor registration form to the provided
              email address.
            </p>

            <button
              onClick={() => setShowEmailSentPopup(false)}
              className="popup-ok-btn"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorBadgeForm;
