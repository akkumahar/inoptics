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

  const [contractorValid, setContractorValid] = useState(null);
  const [checkingContractor, setCheckingContractor] = useState(false);

 
  const [contractorEmail, setContractorEmail] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  const [coreFormData, setCoreFormData] = useState([]);
  const [registrationSent, setRegistrationSent] = useState(false);
  const [showEmailSentPopup, setShowEmailSentPopup] = useState(false);


  const [messageRule, setMessageRule] = useState({
  success_message: "",
  error_message: "",
});



  

  /* ================= FETCH FUNCTION ================= */
  const fetchBadgeData = async () => {
    if (!exhibitorCompany?.trim()) return;

    try {
      const res = await fetch(
        `https://inoptics.in/api/get_contractor_badge.php?exhibitor_company_name=${encodeURIComponent(
          exhibitorCompany,
        )}`,
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

  // 🔥 Strict rule: only allow if contractor matched
  if (contractorValid !== true) {
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

      if (data.success) {
        setContractorValid(data.matched);
      } else {
        setContractorValid(false);
      }
    } catch (err) {
      console.error(err);
      setContractorValid(false);
    } finally {
      setCheckingContractor(false);
    }
  };

  useEffect(() => {
  fetchCoreForms();
  fetchMessageRules();
}, []);


 const fetchCoreForms = async () => {
  try {
    const res = await fetch("https://inoptics.in/api/get_core_forms.php");
    const data = await res.json();

    if (data.success) {
      setCoreFormData(data.data || []);
    }
  } catch (error) {
    console.error("Error fetching core forms");
  }
};



  const handleSendRegistrationMail = async () => {
  if (!contractorEmail?.trim()) {
    toast.error("Please enter contractor email");
    return;
  }

  try {
    setRegisterLoading(true);

    const res = await fetch(
      "https://inoptics.in/api/send_contractor_registration_mails.php",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: contractorEmail.trim(),
          company_name: exhibitorCompany, // only this needed now
        }),
      }
    );

    const data = await res.json();

    if (data.success) {
      toast.success("Registration mail sent successfully ✅");
       setShowEmailSentPopup(true);  // 🔥 show popup
  setContractorEmail("");
    } else {
      toast.error(data.message || "Failed to send mail");
    }
  } catch (error) {
    console.error("Mail error:", error);
    toast.error("Server error");
  } finally {
    setRegisterLoading(false);
  }
};


const fetchMessageRules = async () => {
  try {
    const res = await fetch(
      "https://inoptics.in/api/get_message_rules.php"
    );

    const data = await res.json();

    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      // 🔥 Find rule by match_value
      const rule = data.data.find(
        (item) =>
          item.match_value?.toLowerCase() === "contractor badge"
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
    <span className="match-error">
      {messageRule.error_message}
    </span>
  )}
</label>

  <input
    type="text"
    value={contractorCompany}
    onChange={(e) => {
      const value = e.target.value;
      setContractorCompany(value);
      setRegistrationSent(false); // 🔥 reset
      checkContractorCompany(value);
    }}
    disabled={!hasUnlockedBadge}
  />

  {/* 🔥 INLINE REGISTRATION FORM */}
  {contractorValid === false && contractorCompany.trim() !== "" && (
    <div className="inline-register-box">
      <p>
        Contractor not found. Please register contractor by entering email.
      </p>

      <input
        type="email"
        placeholder="Enter Contractor Email"
        value={contractorEmail}
        onChange={(e) => setContractorEmail(e.target.value)}
      />

      <button
        type="button"
        className="inline-register-btn"
        onClick={handleSendRegistrationMail}
        disabled={registerLoading}
      >
        {registerLoading ? "Sending..." : "Send Registration Form"}
      </button>
    </div>
  )}
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
            disabled={loading || contractorValid !== true}
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
        We have sent the contractor registration form to the provided email address.
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
