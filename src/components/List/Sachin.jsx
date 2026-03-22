import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faEye,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";

// ─── Helpers ────────────────────────────────────────────────────────────────
function getBSValues(categories = []) {
  return [
    ...new Set(
      categories.map((cat) => {
        const c = (cat || "").toLowerCase().trim();
        if (c.includes("bare")) return "B";
        if (c.includes("shell")) return "S";
        return "";
      })
    ),
  ].filter(Boolean);
}

function chunkArray(arr = [], size = 2) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

/**
 * ExhibitorsPanel — Drop-in replacement for the `{overlayContent === "Exhibitors" && (...)}` block.
 *
 * Every state variable and handler that the original JSX uses is passed as a prop.
 * Nothing is hardcoded. The component renders exactly the same HTML structure /
 * className names as the original so your existing CSS continues to work.
 *
 * ── PROPS ──────────────────────────────────────────────────────────────────
 *
 * TABLE / FILTER
 *   groupedData                  {Array}
 *   companySearch                {string}
 *   setCompanySearch             {Function}
 *   bsSearch                     {string}
 *   setBsSearch                  {Function}
 *
 * MODAL VISIBILITY
 *   modalVisible                 {boolean}
 *   setModalVisible              {Function}
 *   showExhibitorAddForm         {boolean}
 *   setShowExhibitorAddForm      {Function}
 *   showExhibitorEditForm        {boolean}
 *   setShowExhibitorEditForm     {Function}
 *   isViewOnly                   {boolean}
 *   setIsViewOnly                {Function}
 *
 * FORM DATA
 *   formData                     {Object}
 *   setFormData                  {Function}
 *   handleChange                 {Function}   (e) => void
 *   handleSubmit                 {Function}   (e) => void
 *   errors                       {Object}
 *   editExhibitor                {Object}
 *   setEditExhibitor             {Function}
 *
 * NAVBAR
 *   activeNavbarItem             {string}
 *   setActiveNavbarItem          {Function}
 *   showFaciaBoardTab            {boolean}
 *
 * ACTIONS
 *   deleteExhibitor              {Function(companyName)}
 *   fetchSelectedFurniture       {Function(companyName)}
 *   fetchExhibitorData           {Function}
 *   handleSendMail               {Function(subject)}
 *   isSendingMail                {boolean}
 *   setIsSendingMail             {Function}
 *
 * TERMS / UNDERTAKING
 *   showTermsDeclaration         {boolean}
 *   setShowTermsDeclaration      {Function}
 *   setHideMainDashboard         {Function}
 *   selectedCompanyName          {string}
 *   setSelectedCompanyName       {Function}
 *   undertakingStatus            {number|null}
 *   declarationUndertakingData   {Array}
 *   handleUnlockUndertaking      {Function(companyName)}
 *
 * STALLS
 *   stallList                    {Array}
 *   stallSummary                 {Object}
 *   pendingAmount                {number|null}
 *   getDiscountPercent           {Function}
 *   stallCategories              {Array}
 *   stallCategory                {string}
 *   setStallCategory             {Function}
 *   editingIndex                 {number|null}
 *   labelToBackendKey            {Object}
 *   visibleColumns               {Array}
 *   customRound                  {Function}
 *   renderLabeledField           {Function(label)}
 *   handleExhibitorStallsSubmit  {Function}
 *   handleUpdateExhibitorStall   {Function}
 *   handleEditExhibitorStall     {Function(stall, rowIndex)}
 *   handleDeleteExhibitorStall   {Function(rowIndex)}
 *   setShowFaciaBoardTab         {Function}
 *
 * POWER REQUIREMENT
 *   powerTypes                   {Array}
 *   currentStep                  {number}
 *   exhibitorSelectedDay         {string}
 *   exhibitorPricePerKw          {string|number}
 *   exhibitorPowerRequired       {string|number}
 *   exhibitorPhase               {string}
 *   exhibitorTotalAmount         {string|number}
 *   exhibitorPreviewList         {Array}
 *   totalPrice                   {number}
 *   cgst                         {number}
 *   sgst                         {number}
 *   igst                         {number}
 *   grandTotal                   {number}
 *   isLocked                     {boolean}
 *   unlockRequested              {boolean}
 *   handleExhibitorPowerChange   {Function}
 *   handleExhibitorPhaseChange   {Function}
 *   handlePrevious               {Function}
 *   handleNext                   {Function}
 *   handleExhibitorAdd           {Function}
 *   handleExhibitorPowerSubmit   {Function}
 *   handleUnlockPowerRequirement {Function(companyName)}
 *   handleResetRow               {Function(item, companyName)}
 *   sendPowerRevisedMail         {Function}
 *   sendPowerVendorMail          {Function}
 *   sendPowerMailToAdmin         {Function}
 *   handleSendPowerDetailsMail   {Function}
 *   powerPendingAmount           {number|null}
 *
 * EXHIBITOR BADGES
 *   handleUpdateFreeExhibitorBadgesSubmit {Function}
 *   handleExhibitorBadgesSubmit  {Function}
 *   getExhibitorBadgeBilling     {Function}
 *   handleUnlockBadges           {Function}
 *
 * APPOINTED CONTRACTOR
 *   contractorData               {Array}
 *   selectedContractorId         {number|null}
 *   selectContractor             {Function(id)}
 *   unselectContractor           {Function}
 *   showRegistrationModal        {boolean}
 *   setShowRegistrationModal     {Function}
 *   showContractorOverlay        {boolean}
 *   setShowContractorOverlay     {Function}
 *   contractorEmail              {string}
 *   setContractorEmail           {Function}
 *   coreFormData                 {Array}
 *   handleSendRegistrationMail   {Function(email)}
 *
 * EXTRA FURNITURE
 *   furnitureData                {Array}
 *   selectedFurniture            {Array}
 *   setSelectedFurniture         {Function}
 *   showFurnitureList            {boolean}
 *   setShowFurnitureList         {Function}
 *   furnitureBilling             {Object}
 *   furnitureVendorDetails       {Array}
 *   handleQuantityChange         {Function(index, value)}
 *   addExhibitorSelectedFurniture {Function}
 *   updateSelectedFurniture      {Function}
 *   lockState                    {Object}
 *   handleAdminUnlock            {Function(companyName)}
 *   handleSendFurnitureMail      {Function(subject)}
 *
 * PAYMENT DETAILS
 *   activePaymentDetailsOverlay  {string|null}
 *   setActiveOverlay             {Function}
 *   selectedStallIndex           {number|null}
 *   setSelectedStallIndex        {Function}
 *   payments                     {Array}
 *   paymentType                  {string}   setPaymentType
 *   paymentDate                  {string}   setPaymentDate
 *   exhibitorBankName            {string}   setExhibitorBankName
 *   receiverBankName             {string}   setReceiverBankName
 *   amount                       {string}   setAmount
 *   tds                          {string}   setTds
 *   totalPaymentWithTDS          {number}
 *   editingIndex (payment)       {number|null}
 *   handleAddPayment             {Function}
 *   handleUpdatePayment          {Function}
 *   handleEditPayment            {Function(index)}
 *   handleDeletePayment          {Function(index)}
 *   remarkText                   {string}   setRemarkText
 *   remarkSaved                  {boolean}
 *   editingRemarkId              {any}
 *   companyRemarks               {Array}
 *   handleSaveRemark             {Function}
 *   handleUpdateCompanyRemark    {Function}
 *   handleSendEmail              {Function}
 *   handleEditCompanyRemark      {Function(item)}
 *   handleDeleteCompanyRemark    {Function(id)}
 *   powerPayments                {Array}
 *   powerPaymentType             {string}   setPowerPaymentType
 *   powerPaymentDate             {string}   setPowerPaymentDate
 *   powerExhibitorBankName       {string}   setPowerExhibitorBankName
 *   powerReceiverBankName        {string}   setPowerReceiverBankName
 *   powerAmount                  {string}   setPowerAmount
 *   powerTds                     {string}   setPowerTds
 *   editingPowerIndex            {number|null}
 *   handleAddPowerPayment        {Function}
 *   handleUpdatePowerPayment     {Function}
 *   handleEditPowerPayment       {Function(index)}
 *   handleDeletePowerPayment     {Function(index)}
 *   badgePayments                {Array}
 *   badgePaymentType             {string}   setBadgePaymentType
 *   badgePaymentDate             {string}   setBadgePaymentDate
 *   badgeExhibitorBankName       {string}   setBadgeExhibitorBankName
 *   badgeReceiverBankName        {string}   setBadgeReceiverBankName
 *   badgeAmount                  {string}   setBadgeAmount
 *   badgeTds                     {string}   setBadgeTds
 *   editingBadgeIndex            {number|null}
 *   handleAddBadgePayment        {Function}
 *   handleUpdateBadgePayment     {Function}
 *   handleEditBadgePayment       {Function(index)}
 *   handleDeleteBadgePayment     {Function(index)}
 *   invoiceOverlayVisible        {boolean}
 *   setInvoiceOverlayVisible     {Function}
 *   formTemplateData             {Object}
 *   setFormTemplateData          {Function}
 *   activeAddress                {Object}
 *   stallProformaNumber          {string}
 *   powerProformaNumber          {string}
 *   issueDate                    {string}
 *   stallService                 {Object}
 *   powerService                 {Object}
 *   stallServiceRows             {Array}
 *   powerServiceRows             {Array}
 *   numberToWords                {Function}
 *   handleDownloadPDF            {Function}
 *   handleSendPDFEmail           {Function}
 *   TemplateLogo                 {string}
 *
 * FACIA BOARD
 *   faciaText                    {string}
 *   setFaciaText                 {Function}
 *   handleSubmitFacia            {Function}
 *   handleUpdateFacia            {Function}
 *
 * BRANDS
 *   brandsData                   {Object}
 *   setBrandsData                {Function}
 *   products                     {Array}
 *   showBrandsEditForm           {boolean}
 *   handleSubmitBrands           {Function}
 *   handleUpdateBrands           {Function}
 *
 * UpdateCompanyName component
 *   UpdateCompanyName            {React.Component}
 * ──────────────────────────────────────────────────────────────────────────
 */
export default function ExhibitorsPanel({
  // table / filter
  groupedData = [],
  companySearch = "",
  setCompanySearch,
  bsSearch = "",
  setBsSearch,

  // modal visibility
  modalVisible,
  setModalVisible,
  showExhibitorAddForm,
  setShowExhibitorAddForm,
  showExhibitorEditForm,
  setShowExhibitorEditForm,
  isViewOnly,
  setIsViewOnly,

  // form data
  formData = {},
  setFormData,
  handleChange,
  handleSubmit,
  errors = {},
  editExhibitor,
  setEditExhibitor,

  // navbar
  activeNavbarItem,
  setActiveNavbarItem,
  showFaciaBoardTab,

  // actions
  deleteExhibitor,
  fetchSelectedFurniture,
  fetchExhibitorData,
  handleSendMail,
  isSendingMail,
  setIsSendingMail,

  // terms
  showTermsDeclaration,
  setShowTermsDeclaration,
  setHideMainDashboard,
  selectedCompanyName,
  setSelectedCompanyName,
  undertakingStatus,
  declarationUndertakingData = [],
  handleUnlockUndertaking,

  // stalls
  stallList = [],
  stallSummary = {},
  pendingAmount,
  getDiscountPercent,
  stallCategories = [],
  stallCategory,
  setStallCategory,
  editingIndex,
  labelToBackendKey = {},
  visibleColumns = [],
  customRound,
  renderLabeledField,
  handleExhibitorStallsSubmit,
  handleUpdateExhibitorStall,
  handleEditExhibitorStall,
  handleDeleteExhibitorStall,
  setShowFaciaBoardTab,

  // power
  powerTypes = [],
  currentStep,
  exhibitorSelectedDay,
  exhibitorPricePerKw,
  exhibitorPowerRequired,
  exhibitorPhase,
  exhibitorTotalAmount,
  exhibitorPreviewList = [],
  totalPrice = 0,
  cgst = 0,
  sgst = 0,
  igst = 0,
  grandTotal = 0,
  isLocked,
  unlockRequested,
  handleExhibitorPowerChange,
  handleExhibitorPhaseChange,
  handlePrevious,
  handleNext,
  handleExhibitorAdd,
  handleExhibitorPowerSubmit,
  handleUnlockPowerRequirement,
  handleResetRow,
  sendPowerRevisedMail,
  sendPowerVendorMail,
  sendPowerMailToAdmin,
  handleSendPowerDetailsMail,
  powerPendingAmount,

  // badges
  handleUpdateFreeExhibitorBadgesSubmit,
  handleExhibitorBadgesSubmit,
  getExhibitorBadgeBilling = () => ({}),
  handleUnlockBadges,

  // contractor
  contractorData = [],
  selectedContractorId,
  selectContractor,
  unselectContractor,
  showRegistrationModal,
  setShowRegistrationModal,
  showContractorOverlay,
  setShowContractorOverlay,
  contractorEmail,
  setContractorEmail,
  coreFormData = [],
  handleSendRegistrationMail,

  // furniture
  furnitureData = [],
  selectedFurniture = [],
  setSelectedFurniture,
  showFurnitureList,
  setShowFurnitureList,
  furnitureBilling = {},
  furnitureVendorDetails = [],
  handleQuantityChange,
  addExhibitorSelectedFurniture,
  updateSelectedFurniture,
  lockState = {},
  handleAdminUnlock,
  handleSendFurnitureMail,

  // payment details
  activePaymentDetailsOverlay,
  setActiveOverlay,
  selectedStallIndex,
  setSelectedStallIndex,
  payments = [],
  paymentType, setPaymentType,
  paymentDate, setPaymentDate,
  exhibitorBankName, setExhibitorBankName,
  receiverBankName, setReceiverBankName,
  amount, setAmount,
  tds, setTds,
  totalPaymentWithTDS,
  handleAddPayment,
  handleUpdatePayment,
  handleEditPayment,
  handleDeletePayment,
  remarkText, setRemarkText,
  remarkSaved,
  editingRemarkId,
  companyRemarks = [],
  handleSaveRemark,
  handleUpdateCompanyRemark,
  handleSendEmail,
  handleEditCompanyRemark,
  handleDeleteCompanyRemark,
  powerPayments = [],
  powerPaymentType, setPowerPaymentType,
  powerPaymentDate, setPowerPaymentDate,
  powerExhibitorBankName, setPowerExhibitorBankName,
  powerReceiverBankName, setPowerReceiverBankName,
  powerAmount, setPowerAmount,
  powerTds, setPowerTds,
  editingPowerIndex,
  handleAddPowerPayment,
  handleUpdatePowerPayment,
  handleEditPowerPayment,
  handleDeletePowerPayment,
  badgePayments = [],
  badgePaymentType, setBadgePaymentType,
  badgePaymentDate, setBadgePaymentDate,
  badgeExhibitorBankName, setBadgeExhibitorBankName,
  badgeReceiverBankName, setBadgeReceiverBankName,
  badgeAmount, setBadgeAmount,
  badgeTds, setBadgeTds,
  editingBadgeIndex,
  handleAddBadgePayment,
  handleUpdateBadgePayment,
  handleEditBadgePayment,
  handleDeleteBadgePayment,
  invoiceOverlayVisible,
  setInvoiceOverlayVisible,
  formTemplateData = {},
  setFormTemplateData,
  activeAddress,
  stallProformaNumber,
  powerProformaNumber,
  issueDate,
  stallService,
  powerService,
  stallServiceRows = [],
  powerServiceRows = [],
  numberToWords,
  handleDownloadPDF,
  handleSendPDFEmail,
  TemplateLogo,

  // facia board
  faciaText,
  setFaciaText,
  handleSubmitFacia,
  handleUpdateFacia,

  // brands
  brandsData = {},
  setBrandsData,
  products = [],
  showBrandsEditForm,
  handleSubmitBrands,
  handleUpdateBrands,

  // sub-component
  UpdateCompanyName,

  // toast (react-hot-toast or similar passed from parent)
  toast,
}) {

  // ── Filtered + sorted rows ──────────────────────────────────────────────
  const rows = groupedData
    .sort((a, b) =>
      a.company_name.localeCompare(b.company_name, undefined, { sensitivity: "base" })
    )
    .map((item, index) => ({ ...item, rowNumber: index + 1 }))
    .filter((item) => {
      const bsValues = getBSValues(item.category);
      const companyMatch = item.company_name.toLowerCase().includes(companySearch.toLowerCase());
      const bsMatch = bsSearch === "" || bsValues.includes(bsSearch);
      return companyMatch && bsMatch;
    });

  // ── Navbar items ────────────────────────────────────────────────────────
  const getNavbarItems = () => {
    const items = [
      "BASIC DETAILS",
      "STALLS",
      "POWER REQUIREMENT",
      "EXHIBITOR BADGES",
      "APPOINTED CONTRACTOR",
      "EXTRA FURNITURE REQUIREMENT",
      "PAYMENT DETAILS",
      "BRANDS",
    ];
    if (showFaciaBoardTab) items.splice(7, 0, "FACIA BOARD");
    return items;
  };

  return (
    <>
      {/* ══ EXHIBITOR TABLE ══════════════════════════════════════════════ */}
      <div className="exhibitor-table-wrapper">
        <div className="exhibitor-table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>COMPANY NAME</th>
                <th>STALL NO</th>
                <th>STALL AREA</th>
                <th>(B/S)</th>
                <th>EMAIL</th>
                <th>MOBILE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => {
                const stallWithCat = item.stall_no.map((stall, i) => {
                  const cat = (item.category[i] || "").toLowerCase();
                  let suffix = "";
                  if (cat.includes("bare")) suffix = "B";
                  else if (cat.includes("shell")) suffix = "S";
                  return `${stall}(${suffix})`;
                });

                const stallAreas = item.stall_area || [];
                const stallChunks = chunkArray(stallWithCat, 2);
                const areaChunks = chunkArray(stallAreas, 2);
                const bsValues = getBSValues(item.category);
                const mobileNumbers = item.mobile ? item.mobile.split(",") : [];

                return (
                  <tr key={item.rowNumber}>
                    <td>{item.rowNumber}</td>
                    <td>{item.company_name}</td>

                    {/* Stall No */}
                    <td>
                      {stallChunks.map((chunk, i) => (
                        <div key={i}>
                          {chunk.join(", ")}
                          {i < stallChunks.length - 1 && ","}
                        </div>
                      ))}
                    </td>

                    {/* Stall Area */}
                    <td>
                      {areaChunks.map((chunk, i) => (
                        <div key={i}>
                          {chunk
                            .map((area) => {
                              const num = parseFloat(area);
                              const formatted = Number.isInteger(num)
                                ? num.toString()
                                : num.toFixed(2);
                              return `${formatted} sq mtr`;
                            })
                            .join(", ")}
                          {i < areaChunks.length - 1 && ","}
                        </div>
                      ))}
                    </td>

                    <td>{bsValues.join(", ")}</td>
                    <td>{item.email}</td>

                    {/* Mobile */}
                    <td>
                      {mobileNumbers.map((num, i) => (
                        <div key={i}>
                          {num.trim()}
                          {i < mobileNumbers.length - 1 && ","}
                        </div>
                      ))}
                    </td>

                    {/* Action Buttons */}
                    <td className="stall-action-buttons">
                      <button
                        className="action-btn edit-btn"
                        title="Edit"
                        onClick={() => {
                          setEditExhibitor(item);
                          setFormData({
                            id: item.id,
                            company_name: item.company_name || "",
                            name: item.name || "",
                            email: item.email || "",
                            address: item.address || "",
                            city: item.city || "",
                            state: item.state || "",
                            pin: item.pin || "",
                            mobile: item.mobile || "",
                            telephone: item.telephone || "",
                            fax: item.fax || "",
                            gst: item.gst || "",
                            secondary_emails: item.secondary_emails || "",
                            password: item.password || "",
                            stall_no: item.stall_no || "",
                            category: item.category || "",
                          });
                          fetchSelectedFurniture(item.company_name || "");
                          setActiveNavbarItem("BASIC DETAILS");
                          setShowExhibitorEditForm(true);
                          setIsViewOnly(false);
                          setTimeout(() => setModalVisible(true), 10);
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>

                      <button
                        className="action-btn delete-btn"
                        title="Delete"
                        onClick={() => deleteExhibitor(item.company_name)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedCompanyName(item.company_name);
                          setShowTermsDeclaration(true);
                          setHideMainDashboard(true);
                        }}
                        title="Terms"
                        style={{
                          backgroundColor:
                            Number(item.undertaking_accepted) === 1
                              ? "#fbc02d"
                              : "#1976d2",
                          color:
                            Number(item.undertaking_accepted) === 1
                              ? "#000"
                              : "#fff",
                          padding: "6px 12px",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                      >
                        <FontAwesomeIcon icon={faFileAlt} />
                      </button>

                      <button
                        className="action-btn view-btn"
                        title="View"
                        onClick={() => {
                          setEditExhibitor(item);
                          setFormData({
                            id: item.id,
                            company_name: item.company_name || "",
                            name: item.name || "",
                            email: item.email || "",
                            address: item.address || "",
                            city: item.city || "",
                            state: item.state || "",
                            pin: item.pin || "",
                            mobile: item.mobile || "",
                            telephone: item.telephone || "",
                            fax: item.fax || "",
                            gst: item.gst || "",
                            secondary_emails: item.secondary_emails || "",
                            password: item.password || "",
                            stall_no: item.stall_no || "",
                            category: item.category || "",
                          });
                          setActiveNavbarItem("BASIC DETAILS");
                          setShowExhibitorEditForm(true);
                          setIsViewOnly(true);
                          setTimeout(() => setModalVisible(true), 10);
                        }}
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ TERMS MODAL ══════════════════════════════════════════════════ */}
      {showTermsDeclaration && (
        <div className={`full-modal-overlay ${modalVisible ? "show" : ""}`}>
          <div className="modal-container" style={{ flexDirection: "column" }}>
            <div className="form-overlay-header">
              <span>{selectedCompanyName}</span>
              <button
                className="cancel-button-top"
                onClick={() => {
                  setModalVisible(false);
                  setTimeout(() => {
                    setShowExhibitorAddForm(false);
                    setShowTermsDeclaration(false);
                  }, 300);
                }}
              >
                ← Back
              </button>
            </div>

            <div className="declaration-overlay">
              <div className="declaration-container">
                <div className="declaration-header-flex">
                  <h3 className="declaration-heading">Terms & Declaration</h3>
                  <button onClick={() => setShowTermsDeclaration(false)} className="close-btn">×</button>
                </div>

                {undertakingStatus === null ? (
                  <div>Loading...</div>
                ) : undertakingStatus === 0 ? (
                  <div className="not-accepted-box">
                    ❗ {selectedCompanyName} has NOT accepted Undertaking.
                  </div>
                ) : (
                  <>
                    <ol className="declaration-list">
                      {declarationUndertakingData.map((point, index) => (
                        <li key={index}>
                          <strong>{point.title}:</strong> {point.text}
                        </li>
                      ))}
                    </ol>
                    <div style={{ marginTop: "20px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => handleUnlockUndertaking(selectedCompanyName)}
                        className="unlock-btn"
                      >
                        Unlock Undertaking
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ EDIT / ADD / VIEW MODAL ══════════════════════════════════════ */}
      {(showExhibitorAddForm || showExhibitorEditForm) && (
        <div className={`full-modal-overlay ${modalVisible ? "show" : ""}`}>
          <div className="modal-container" style={{ flexDirection: "column" }}>

            {/* Top Header */}
            <div className="form-overlay-header">
              <span>
                {isViewOnly
                  ? `View: ${formData.company_name}${formData.state ? `, ${formData.state}` : ""}`
                  : showExhibitorEditForm
                  ? `${formData.company_name}${formData.state ? `, ${formData.state}` : ""}`
                  : "New Exhibitor Request"}
              </span>
              <button
                className="cancel-button-top"
                onClick={() => {
                  setModalVisible(false);
                  setTimeout(() => {
                    setShowExhibitorAddForm(false);
                    setShowExhibitorEditForm(false);
                  }, 300);
                }}
              >
                ← Back
              </button>
            </div>

            {/* ── VIEW MODE (READ-ONLY) ── */}
            {isViewOnly ? (
              <div className="view-only-details">
                <h3 style={{ marginBottom: "10px" }}>BASIC DETAILS</h3>
                <div className="details-grid">
                  <p><strong>COMPANY NAME:</strong> <span>{formData.company_name}</span></p>
                  <p><strong>NAME:</strong> <span>{formData.name}</span></p>
                  <p><strong>EMAIL:</strong> <span>{formData.email}</span></p>
                  <p><strong>ADDRESS:</strong> <span>{formData.address}</span></p>
                  <p><strong>CITY:</strong> <span>{formData.city}</span></p>
                  <p><strong>STATE:</strong> <span>{formData.state}</span></p>
                  <p><strong>PIN:</strong> <span>{formData.pin}</span></p>
                  <p><strong>MOBILE:</strong> <span>{formData.mobile}</span></p>
                  <p><strong>GST:</strong> <span>{formData.gst}</span></p>
                  <p><strong>SECONDARY EMAILS:</strong> <span>{formData.secondary_emails}</span></p>
                </div>

                <h3 style={{ margin: "20px 0 10px" }}>STALLS</h3>
                {stallList.length === 0 && <p>No stalls added</p>}
                {stallList.map((stall, i) => (
                  <div key={i} className="stall-card" style={{ marginBottom: "15px" }}>
                    <p><strong>STALL NUMBER:</strong> {stall.stall_number}</p>
                    <p><strong>STALL CATEGORY:</strong> {stall.stall_category}</p>
                    <p><strong>STALL PRICE:</strong> ₹{stall.stall_price}</p>
                    <p><strong>CURRENCY:</strong> {stall.currency}</p>
                    <p><strong>STALL AREA:</strong> {stall.stall_area}</p>
                    <p><strong>TOTAL:</strong> {stall.total}</p>
                    <p><strong>DISCOUNT:</strong> {stall.discount_percent}%</p>
                    <p><strong>DISCOUNT AMOUNT:</strong> {stall.discounted_amount}</p>
                    <p><strong>TOTAL AFTER DISCOUNT:</strong> {stall.total_after_discount}</p>
                    <p><strong>CGST:</strong> {stall.sgst_9_percent}%</p>
                    <p><strong>SGST:</strong> {stall.cgst_9_percent}%</p>
                    <p><strong>IGST:</strong> {stall.igst_18_percent}%</p>
                    <p><strong>GRAND TOTAL:</strong> ₹{stall.grand_total}</p>
                    <hr />
                  </div>
                ))}

                {/* Payment Cards */}
                <div className="payment-cards-container">
                  <h2 className="payment-details-form-heading">PAYMENT DETAILS</h2>
                  <div className="payment-card-grid">

                    {/* Stall Card */}
                    <div className="payment-card">
                      <h4>Stall Particulars</h4>
                      <div className="billing-summary">
                        <div className="billing-row"><span>Total:</span><strong>{stallSummary.total?.toFixed(2)} {stallSummary.currency}</strong></div>
                        {stallSummary.discounted_amount > 0 && (
                          <div className="billing-row">
                            <span>Discount ({getDiscountPercent(stallSummary)}%):</span>
                            <strong>{stallSummary.discounted_amount?.toFixed(2)} {stallSummary.currency}</strong>
                          </div>
                        )}
                        {formData?.state?.toLowerCase() === "delhi" ? (
                          <>
                            <div className="billing-row"><span>SGST (9%):</span><strong>{stallSummary.sgst?.toFixed(2)} {stallSummary.currency}</strong></div>
                            <div className="billing-row"><span>CGST (9%):</span><strong>{stallSummary.cgst?.toFixed(2)} {stallSummary.currency}</strong></div>
                          </>
                        ) : (
                          <div className="billing-row"><span>IGST (18%):</span><strong>{stallSummary.igst?.toFixed(2)} {stallSummary.currency}</strong></div>
                        )}
                        <div className="billing-row total"><span>Grand Total:</span><strong>{stallSummary.grand_total?.toFixed(2)} {stallSummary.currency}</strong></div>
                        {pendingAmount !== null && (
                          <div className="billing-row" style={{ color: pendingAmount <= 0 ? "green" : "red", fontWeight: "bold", marginTop: "10px" }}>
                            <span>{pendingAmount <= 0 ? "PAYMENT CLEARED" : "PENDING AMOUNT"}</span>
                            <strong>{pendingAmount.toFixed(2)} {stallSummary.currency}</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Power Card */}
                    <div className="payment-card">
                      <h4>Power Requirement</h4>
                      <div className="billing-summary">
                        <div className="billing-row"><span>Total:</span><strong>{totalPrice.toFixed(2)} ₹</strong></div>
                        {formData?.state?.toLowerCase() === "delhi" ? (
                          <>
                            <div className="billing-row"><span>CGST (9%):</span><strong>{cgst.toFixed(2)} ₹</strong></div>
                            <div className="billing-row"><span>SGST (9%):</span><strong>{sgst.toFixed(2)} ₹</strong></div>
                          </>
                        ) : (
                          <div className="billing-row"><span>IGST (18%):</span><strong>{igst.toFixed(2)} ₹</strong></div>
                        )}
                        <div className="billing-row total"><span>Grand Total:</span><strong>{grandTotal.toFixed(2)} ₹</strong></div>
                        {powerPendingAmount !== null && (
                          <div className="billing-row" style={{ color: powerPendingAmount <= 0 ? "green" : "red", fontWeight: "bold", marginTop: "10px" }}>
                            <span>{powerPendingAmount <= 0 ? "PAYMENT CLEARED" : "PENDING AMOUNT"}</span>
                            <strong>{powerPendingAmount.toFixed(2)} ₹</strong>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Badges Card */}
                    {(() => {
                      const { count, total, cgst: bc, sgst: bs, igst: bi, grandTotal: bg } = getExhibitorBadgeBilling();
                      return (
                        <div className="payment-card">
                          <h4>Exhibitor Badges</h4>
                          <div className="billing-summary">
                            <div className="billing-row"><span>Extra Badges:</span><strong>{count || 0}</strong></div>
                            <div className="billing-row"><span>Total Amount:</span><strong>₹{total?.toFixed(2) || "0.00"}</strong></div>
                            {formData?.state?.toLowerCase() === "delhi" ? (
                              <>
                                <div className="billing-row"><span>CGST (9%):</span><strong>₹{bc?.toFixed(2) || "0.00"}</strong></div>
                                <div className="billing-row"><span>SGST (9%):</span><strong>₹{bs?.toFixed(2) || "0.00"}</strong></div>
                              </>
                            ) : (
                              <div className="billing-row"><span>IGST (18%):</span><strong>₹{bi?.toFixed(2) || "0.00"}</strong></div>
                            )}
                            <div className="billing-row total"><span>Grand Total:</span><strong>₹{bg?.toFixed(2) || "0.00"}</strong></div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Furniture Table */}
                <div className="selected-furniture-table-wrapper">
                  <table className="selected-furniture-table">
                    <colgroup>
                      <col style={{ width: "40px" }} /><col style={{ width: "120px" }} />
                      <col style={{ width: "180px" }} /><col style={{ width: "100px" }} />
                      <col style={{ width: "100px" }} /><col style={{ width: "100px" }} />
                      <col style={{ width: "100px" }} />
                    </colgroup>
                    <thead>
                      <tr><th>ID</th><th>Image</th><th>Name</th><th>Price</th><th>Quantity</th><th>Total</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {selectedFurniture.length > 0 ? selectedFurniture.map((item, index) => (
                        <tr key={item.id}>
                          <td>{index + 1}</td>
                          <td><img src={`https://www.inoptics.in/api/uploads/${item.image}`} alt={item.name} width="100" height="100" style={{ objectFit: "cover" }} /></td>
                          <td>{item.name}</td>
                          <td>₹{item.price}</td>
                          <td>
                            <input type="number" min="1" value={item.quantity || ""} onChange={(e) => handleQuantityChange(index, e.target.value)} style={{ width: "60px" }} />
                          </td>
                          <td>₹{item.quantity ? (item.quantity * item.price).toFixed(2) : "0.00"}</td>
                          <td>
                            <button onClick={() => setSelectedFurniture(selectedFurniture.filter((_, i) => i !== index))}>Delete</button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="7" style={{ textAlign: "center", padding: "10px" }}>No furniture selected yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Furniture Billing */}
                <h3>Particulars</h3>
                <div style={{ fontSize: "15px", lineHeight: "1.8", fontFamily: "Segoe UI" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Total</span><span>₹{furnitureBilling.amount?.toFixed(2) || "0.00"}</span></div>
                  {formData.state?.toLowerCase() === "delhi" ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span>CGST (9%)</span><span>₹{furnitureBilling.cgst?.toFixed(2) || "0.00"}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}><span>SGST (9%)</span><span>₹{furnitureBilling.sgst?.toFixed(2) || "0.00"}</span></div>
                    </>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>IGST (18%)</span><span>₹{furnitureBilling.igst?.toFixed(2) || "0.00"}</span></div>
                  )}
                  <hr style={{ margin: "15px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
                    <span>GRAND TOTAL</span><span>₹{furnitureBilling.grandTotal?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              </div>

            ) : (
              /* ── EDIT / ADD MODE ── */
              <>
                {/* Top Navbar */}
                <div className="modal-navbar">
                  <ul className="navbar-list">
                    {getNavbarItems().map((item) => (
                      <li
                        key={item}
                        className={`navbar-item ${activeNavbarItem === item ? "active" : ""}`}
                        onClick={() => setActiveNavbarItem(item)}
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="modal-content">

                  {/* ── BASIC DETAILS ── */}
                  {activeNavbarItem === "BASIC DETAILS" && (
                    <>
                      <div className="basic-details-form-with-chnage-company-name">
                        <div className="basic-details-form slide-up-form">
                          <form className="form-grid" onSubmit={handleSubmit}>

                            <div className="form-group full-width">
                              <label>COMPANY NAME <span style={{ color: "red" }}>*</span></label>
                              <input type="text" name="company_name" value={formData.company_name || ""} onChange={handleChange} className={errors.company_name ? "input-error" : ""} />
                              {errors.company_name && <span className="error-text">This field is required</span>}
                            </div>

                            <div className="form-group full-width">
                              <label>NAME <span style={{ color: "red" }}>*</span></label>
                              <input type="text" name="name" value={formData.name || ""} onChange={handleChange} className={errors.name ? "input-error" : ""} />
                              {errors.name && <span className="error-text">This field is required</span>}
                            </div>

                            <div className="form-group full-width">
                              <label>ADDRESS <span style={{ color: "red" }}>*</span></label>
                              <input type="text" name="address" value={formData.address || ""} onChange={handleChange} className={errors.address ? "input-error" : ""} />
                              {errors.address && <span className="error-text">This field is required</span>}
                            </div>

                            <div className="row-group">
                              <div className="form-subgroup">
                                <label>CITY <span style={{ color: "red" }}>*</span></label>
                                <input type="text" name="city" value={formData.city || ""} onChange={handleChange} className={errors.city ? "input-error" : ""} />
                                {errors.city && <span className="error-text">This field is required</span>}
                              </div>
                              <div className="form-subgroup">
                                <label>STATE <span style={{ color: "red" }}>*</span></label>
                                <input type="text" name="state" value={formData.state || ""} onChange={handleChange} className={errors.state ? "input-error" : ""} />
                                {errors.state && <span className="error-text">This field is required</span>}
                              </div>
                              <div className="form-subgroup">
                                <label>PINCODE <span style={{ color: "red" }}>*</span></label>
                                <input type="text" name="pin" value={formData.pin || ""} onChange={handleChange} className={errors.pin ? "input-error" : ""} />
                                {errors.pin && <span className="error-text">This field is required</span>}
                              </div>
                            </div>

                            <div className="row-group">
                              <div className="form-subgroup">
                                <label>MOBILE <span style={{ color: "red" }}>*</span></label>
                                <input type="text" name="mobile" placeholder="9876543210, 8765432109" value={formData.mobile || ""} onChange={handleChange} className={errors.mobile ? "input-error" : ""} />
                                {errors.mobile && <span className="error-text">This field is required</span>}
                              </div>
                              <div className="form-subgroup">
                                <label>TELEPHONE</label>
                                <input type="text" name="telephone" value={formData.telephone || ""} onChange={handleChange} />
                              </div>
                            </div>

                            <div className="row-group">
                              <div className="form-subgroup">
                                <label>EMAIL <span style={{ color: "red" }}>*</span></label>
                                <input type="text" name="email" value={formData.email || ""} onChange={handleChange} className={errors.email ? "input-error" : ""} />
                                {errors.email && <span className="error-text">This field is required</span>}
                              </div>
                              <div className="form-subgroup">
                                <label>SECONDARY EMAILS</label>
                                <input type="text" name="secondary_emails" placeholder="email1@example.com, email2@example.com" value={formData.secondary_emails || ""} onChange={handleChange} />
                              </div>
                            </div>

                            <div className="row-group gst-row">
                              <div className="form-subgroup">
                                <label>GST</label>
                                <input type="text" name="gst" value={formData.gst || ""} onChange={handleChange} />
                              </div>
                              <div className="form-subgroup button-group">
                                {showExhibitorEditForm && (
                                  <button type="button" className="send-mail-btn" onClick={() => handleSendMail("Exhibitor Login & Password")}>
                                    Send Mail
                                  </button>
                                )}
                                <button type="submit" className="update-btn">
                                  {showExhibitorEditForm ? "Update" : "Submit"}
                                </button>
                              </div>
                            </div>

                            {showExhibitorEditForm && (
                              <div className="form-row">
                                <div className="form-group password-label">
                                  <p style={{ fontWeight: "600", fontFamily: "montserrat" }}>
                                    Password: <span>{formData.password || "N/A"}</span>
                                  </p>
                                </div>
                              </div>
                            )}
                          </form>
                          {isSendingMail && (
                            <div className="waiting-overlay">
                              <div className="waiting-loader"></div>
                              <p>Sending mail, please wait...</p>
                            </div>
                          )}
                        </div>
                        {UpdateCompanyName && (
                          <div>
                            <UpdateCompanyName fetchExhibitorData={fetchExhibitorData} />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* ── STALLS ── */}
                  {activeNavbarItem === "STALLS" && (
                    <div className="stalls-form-wrapper">
                      <div className="stalls-form-row">
                        <div className="stalls-form">
                          <form
                            className="stalls-form-structured"
                            onSubmit={editingIndex !== null ? handleUpdateExhibitorStall : handleExhibitorStallsSubmit}
                          >
                            <div className="row">
                              <div className="field-box"><div className="field">{renderLabeledField("HALL NUMBER")}</div></div>
                              <div className="field-box"><div className="field">{renderLabeledField("STALL NUMBER")}</div></div>
                            </div>

                            <div className="row">
                              <div className="field-box">
                                <div className="field">
                                  <label>STALL CATEGORY</label>
                                  <select
                                    value={stallCategory}
                                    onChange={(e) => {
                                      const selected = e.target.value;
                                      setStallCategory(selected);
                                      if (selected.startsWith("Shell Scheme")) {
                                        setShowFaciaBoardTab(true);
                                      } else {
                                        setShowFaciaBoardTab(false);
                                        if (activeNavbarItem === "FACIA BOARD") setActiveNavbarItem("STALLS");
                                      }
                                      const matchedCategory = stallCategories.find((cat) => cat.category === selected);
                                      if (matchedCategory && formData.currency) {
                                        let price = 0;
                                        if (formData.currency === "Rupees") price = matchedCategory.rupees;
                                        else if (formData.currency === "Dollar") price = matchedCategory.dollar;
                                        else if (formData.currency === "Euro") price = matchedCategory.euro;
                                        setFormData((prev) => ({ ...prev, stall_category: selected, stall_price: parseFloat(price) || 0 }));
                                      } else {
                                        setFormData((prev) => ({ ...prev, stall_category: selected }));
                                      }
                                    }}
                                  >
                                    <option value="">-- Select Category --</option>
                                    {stallCategories.map((cat) => (
                                      <option key={cat.id} value={cat.category}>{cat.category}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="field-box"><div className="field">{renderLabeledField("STALL AREA")}</div></div>
                            </div>

                            <div className="row">
                              <div className="field-box">
                                <div className="field">
                                  <label>CURRENCY</label>
                                  <select
                                    value={formData.currency}
                                    onChange={(e) => {
                                      const selectedCurrency = e.target.value;
                                      setFormData((prev) => ({ ...prev, currency: selectedCurrency }));
                                      const matchedCategory = stallCategories.find((cat) => cat.category === stallCategory);
                                      if (matchedCategory) {
                                        let price = 0;
                                        if (selectedCurrency === "Rupees") price = matchedCategory.rupees;
                                        else if (selectedCurrency === "Dollar") price = matchedCategory.dollar;
                                        else if (selectedCurrency === "Euro") price = matchedCategory.euro;
                                        setFormData((prev) => ({ ...prev, stall_price: parseFloat(price) || 0 }));
                                      }
                                    }}
                                  >
                                    <option value="">-- Select Currency --</option>
                                    <option value="Rupees">Rupees</option>
                                    <option value="Dollar">Dollar</option>
                                    <option value="Euro">Euro</option>
                                  </select>
                                </div>
                              </div>
                              <div className="field-box"><div className="field">{renderLabeledField("DISCOUNT(%)")}</div></div>
                            </div>

                            {!isViewOnly && (
                              <div className="stall-form-button-group">
                                {stallList.length > 0 && (
                                  <button
                                    type="button"
                                    className="send-mail-btn"
                                    disabled={isSendingMail}
                                    onClick={async () => {
                                      try {
                                        setIsSendingMail(true);
                                        await handleSendMail("InOptics 2026 @ Stall Booking Confirmation");
                                        alert("Mail sent successfully!");
                                      } catch (error) {
                                        alert("Something went wrong while sending the mail.");
                                      } finally {
                                        setIsSendingMail(false);
                                      }
                                    }}
                                  >
                                    {isSendingMail ? "Sending..." : "Send Mail"}
                                  </button>
                                )}
                                {editingIndex !== null ? (
                                  <button type="submit" className="edit-stall-btn">Edit Stall</button>
                                ) : (
                                  <button type="submit" className="add-stall-btn">Add Stall</button>
                                )}
                              </div>
                            )}
                          </form>
                        </div>

                        {/* Billing Details */}
                        <div className="billing-details">
                          <h3>Particulars</h3>
                          <div className="billing-row"><span>Stall Number:</span><strong>{formData.stall_number || "-"}</strong></div>
                          <div className="billing-row"><span>Hall Number:</span><strong>{formData.hall_number || "-"}</strong></div>
                          <div className="billing-row"><span>Stall Category:</span><strong>{formData.stall_category || "-"}</strong></div>
                          <div className="billing-row"><span>Stall Area:</span><strong>{formData.stall_area || "-"}</strong></div>
                          <div className="billing-row"><span>Stall Price(per sq mtrs):</span><strong>{formData.stall_price || "-"} {formData.currency || ""}</strong></div>
                          <h3>Billing Details</h3>
                          <div className="billing-row"><span>Total:</span><strong>{customRound(formData.total)} {formData.currency}</strong></div>
                          {formData.discount && parseFloat(formData.discount) > 0 && (
                            <>
                              <div className="billing-row"><span>Discount ({formData.discount}%):</span><strong>{customRound(formData.discounted_amount)} {formData.currency}</strong></div>
                              <hr />
                              <div className="billing-row"><span>Amount After Discount:</span><strong>{customRound(formData.total_after_discount)} {formData.currency}</strong></div>
                            </>
                          )}
                          {formData.state?.toLowerCase() === "delhi" && formData.currency === "Rupees" ? (
                            <>
                              <div className="billing-row"><span>SGST (9%):</span><strong>{customRound(formData.sgst9)} {formData.currency}</strong></div>
                              <div className="billing-row"><span>CGST (9%):</span><strong>{customRound(formData.cgst9)} {formData.currency}</strong></div>
                            </>
                          ) : (
                            <div className="billing-row"><span>IGST (18%):</span><strong>{customRound(formData.igst18)} {formData.currency}</strong></div>
                          )}
                          <div className="billing-row total"><span>Grand Total:</span><strong>{customRound(formData.grand_total)} {formData.currency}</strong></div>
                        </div>
                      </div>

                      {/* Stall Table */}
                      <div className="Exhibitor-stall-table-scroll-wrapper">
                        <div className="Exhibitor-stall-table-container">
                          <table>
                            <thead>
                              <tr>
                                {["STALL NUMBER","HALL NUMBER","STALL CATEGORY","STALL PRICE","CURRENCY","STALL AREA","TOTAL","DISCOUNT(%)","DISCOUNTED AMOUNT","TOTAL AFTER DISCOUNT","SGST(9%)","CGST(9%)","IGST(18%)","GRAND TOTAL"]
                                  .filter((label) => {
                                    const key = labelToBackendKey[label];
                                    return stallList.some((stall) => stall[key] !== null && stall[key] !== undefined && stall[key] !== "");
                                  })
                                  .map((label, index) => <th key={index}>{label}</th>)}
                                <th>ACTION</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stallList.map((stall, rowIndex) => {
                                const cols = Object.keys(labelToBackendKey).filter((label) => {
                                  const key = labelToBackendKey[label];
                                  return stallList.some((s) => s[key] !== null && s[key] !== undefined && s[key] !== "");
                                });
                                return (
                                  <tr key={rowIndex}>
                                    {cols.map((label, colIndex) => {
                                      const backendKey = labelToBackendKey[label];
                                      let cellValue = stall[backendKey];
                                      if (label === "STALL AREA" && cellValue !== null && cellValue !== undefined && cellValue !== "") {
                                        const num = parseFloat(cellValue);
                                        if (!isNaN(num)) {
                                          cellValue = `${Number.isInteger(num) ? num : num.toFixed(2)} sq mtr`;
                                        }
                                      }
                                      return <td key={colIndex}>{cellValue}</td>;
                                    })}
                                    <td className="stall-action-buttons">
                                      <button className="edit-btn" onClick={() => handleEditExhibitorStall(stall, rowIndex)}><FontAwesomeIcon icon={faEdit} /></button>
                                      <button className="power-reset-btn" onClick={() => handleDeleteExhibitorStall(rowIndex)}><FontAwesomeIcon icon={faTrash} /></button>
                                    </td>
                                  </tr>
                                );
                              })}
                              {stallList.length >= 2 && (
                                <tr className="grand-total-row" style={{ fontWeight: "bold", background: "#f1f1f1" }}>
                                  {visibleColumns.map((label) => {
                                    const key = labelToBackendKey[label];
                                    switch (label) {
                                      case "STALL NUMBER": return <td key={key}>{stallList.map((s) => s.stall_number).join(", ")}</td>;
                                      case "TOTAL": return <td key={key}>{Math.round(stallList.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0))}</td>;
                                      case "DISCOUNT(%)": return <td key={key}>{stallList[0]?.discount_percent || 0}</td>;
                                      case "DISCOUNTED AMOUNT": return <td key={key}>{Math.round(stallList.reduce((sum, s) => sum + (parseFloat(s.discounted_amount) || 0), 0))}</td>;
                                      case "TOTAL AFTER DISCOUNT": return <td key={key}>{Math.round(stallList.reduce((sum, s) => sum + (parseFloat(s.total_after_discount) || 0), 0))}</td>;
                                      case "SGST(9%)": return <td key={key}>{Math.round(stallList.reduce((sum, s) => sum + (parseFloat(s.sgst_9_percent) || 0), 0))}</td>;
                                      case "CGST(9%)": return <td key={key}>{Math.round(stallList.reduce((sum, s) => sum + (parseFloat(s.cgst_9_percent) || 0), 0))}</td>;
                                      case "IGST(18%)": return <td key={key}>{Math.round(stallList.reduce((sum, s) => sum + (parseFloat(s.igst_18_percent) || 0), 0))}</td>;
                                      case "GRAND TOTAL": return <td key={key}>{Math.round(stallList.reduce((sum, s) => sum + (parseFloat(s.grand_total) || 0), 0))}</td>;
                                      default: return <td key={key}></td>;
                                    }
                                  })}
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      {isSendingMail && (
                        <div className="waiting-overlay"><div className="waiting-loader"></div><p>Sending mail, please wait...</p></div>
                      )}
                    </div>
                  )}

                  {/* ── POWER REQUIREMENT ── */}
                  {activeNavbarItem === "POWER REQUIREMENT" && (
                    <>
                      <div className="power-requirement-wrapper">
                        <div className="power-requirement-form-left">
                          <ul id="progressbar">
                            {powerTypes.map((type, index) => (
                              <li key={type} className={index <= currentStep ? "active" : ""}>{type}</li>
                            ))}
                          </ul>
                          <form className="power-requirement-stalls-form-wrapper">
                            {powerTypes.map((type, index) => (
                              <div key={type} className={`power-requirement-stalls-form-grid ${index === currentStep ? "slide-active" : index < currentStep ? "slide-left" : "slide-right"}`}>
                                <div className="power-requirement-stalls-form-row">
                                  <div className="power-requirement-stalls-form-group">
                                    <label>TYPE:</label><input type="text" value={exhibitorSelectedDay} readOnly />
                                  </div>
                                  <div className="power-requirement-stalls-form-group">
                                    <label>PRICE PER KW:</label><input type="text" value={exhibitorPricePerKw} readOnly />
                                  </div>
                                </div>
                                <div className="power-requirement-stalls-form-row">
                                  <div className="power-requirement-stalls-form-group">
                                    <label>POWER REQUIRED:</label>
                                    <input type="number" name="power_required" value={exhibitorPowerRequired} onChange={handleExhibitorPowerChange} />
                                  </div>
                                  <div className="power-requirement-stalls-form-group">
                                    <label>PHASE:</label>
                                    <div className="phase-options">
                                      <label><input type="radio" name={`phase-${index}`} value="Single Phase" checked={exhibitorPhase === "Single Phase"} onChange={handleExhibitorPhaseChange} />Single</label>
                                      <label><input type="radio" name={`phase-${index}`} value="Three Phase" checked={exhibitorPhase === "Three Phase"} onChange={handleExhibitorPhaseChange} />Three</label>
                                    </div>
                                  </div>
                                </div>
                                <div className="power-requirement-stalls-form-row">
                                  <div className="power-requirement-stalls-form-group">
                                    <label>TOTAL AMOUNT:</label><input type="text" name="total_amount" value={exhibitorTotalAmount} readOnly />
                                  </div>
                                  <div className="power-requirement-add-button-inline">
                                    {currentStep > 0 && <button type="button" onClick={handlePrevious}>Previous</button>}
                                    {currentStep < powerTypes.length - 1
                                      ? <button type="button" onClick={handleNext}>Next</button>
                                      : <button type="button" onClick={handleExhibitorAdd}>Add</button>}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </form>
                        </div>

                        <div className="power-requirement-instruction-box">
                          <h3>Power Requirement Guidelines</h3>
                          <ul>
                            <li>Power requirements for setup days and exhibition days must be submitted separately.</li>
                            <li>Power will be arranged as per the requirement form. Requests made after 28th February 2026 may incur additional charges.</li>
                            <li>If unsure of your needs, please consult your fabricator for accurate details.</li>
                            <li>Kindly ensure your contractor uses quality, thick wiring. Additional charges may apply if power usage exceeds the amount ordered.</li>
                            <li>Thank you for your cooperation.</li>
                          </ul>
                          <div className="power-requirement-top-buttons-inside-box">
                            {showExhibitorEditForm && (
                              <button className="power-btn send-mail-btn" onClick={() => toast.promise((async () => { await sendPowerRevisedMail(formData.company_name, formData.email); await sendPowerVendorMail(formData.company_name); })(), { loading: "Sending update mail...", success: "Updated power mail sent successfully", error: "Failed to send mail" })}>
                                Send Update Power Mail
                              </button>
                            )}
                            <button className="power-btn send-mail-btn" onClick={() => toast.promise((async () => { await sendPowerMailToAdmin(formData.company_name); await handleSendPowerDetailsMail(formData.company_name); })(), { loading: "Sending mail...", success: "Mail sent successfully", error: "Failed to send mail" })}>
                              Send Mail
                            </button>
                            {!isViewOnly && (
                              <>
                                <button className="power-btn submit-btn" onClick={handleExhibitorPowerSubmit}>
                                  {showExhibitorEditForm ? "Update" : "Submit"}
                                </button>
                                {isLocked && (
                                  <button
                                    className="power-btn unlock-btn"
                                    style={{ backgroundColor: unlockRequested ? "#888" : "#ff9800", cursor: unlockRequested ? "not-allowed" : "pointer" }}
                                    disabled={unlockRequested}
                                    onClick={() => handleUnlockPowerRequirement(formData.company_name)}
                                  >
                                    {unlockRequested ? "Unlock Requested" : "Unlock"}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="power-requirement-below-section">
                        <div className="power-requirement-table-container">
                          <table>
                            <thead>
                              <tr><th>Days</th><th>Price per KW</th><th>Power Required</th><th>Phase</th><th>Total Amount</th><th>Action</th></tr>
                            </thead>
                            <tbody>
                              {exhibitorPreviewList.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: "center", padding: "10px", color: "#e5e9ee" }}>No data to display</td></tr>
                              ) : exhibitorPreviewList.map((item, i) => (
                                <tr key={i}>
                                  <td>{item.day}</td><td>{item.pricePerKw}</td><td>{item.powerRequired}</td><td>{item.phase}</td><td>{item.totalAmount}</td>
                                  <td><button className="power-reset-btn" onClick={() => handleResetRow(item, formData.company_name)}>Remove</button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="power-requirement-billing">
                          <h3>Power Requirement Billing</h3>
                          <div className="power-requirement-stalls-forms-group"><span className="power-label">Total Price:</span><strong>{totalPrice.toFixed(2)} ₹</strong></div>
                          {formData.state?.toLowerCase() === "delhi" ? (
                            <>
                              <div className="power-requirement-stalls-forms-group"><span className="power-label">CGST (9%):</span><strong>{cgst.toFixed(2)} ₹</strong></div>
                              <div className="power-requirement-stalls-forms-group"><span className="power-label">SGST (9%):</span><strong>{sgst.toFixed(2)} ₹</strong></div>
                            </>
                          ) : (
                            <div className="power-requirement-stalls-forms-group"><span className="power-label">IGST (18%):</span><strong>{igst.toFixed(2)} ₹</strong></div>
                          )}
                          <div className="power-requirement-stalls-forms-group total"><span className="power-label">Grand Total:</span><strong>{grandTotal.toFixed(2)} ₹</strong></div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── EXHIBITOR BADGES ── */}
                  {activeNavbarItem === "EXHIBITOR BADGES" && (
                    <div className="exhibitor-badges-form slide-up-form">
                      <div className="badge-flex-container">
                        <div className="badge-left">
                          <div className="badges-instruction-box">
                            <h3 className="instruction-heading">Exhibitor Badge Policy</h3>
                            <div className="instruction-text">
                              <br /><br />
                              As per your stall size, you will receive <strong>{formData.free_badges || 0}</strong> complimentary badge{formData.free_badges === 1 ? "" : "s"} for the exhibition.
                              <br /><br />
                              Additional badges can be requested at a cost of ₹100 per badge. However, any badge requests made after <strong>20th March 2026</strong> will be charged at ₹200 per badge.
                              <br /><br />
                              We kindly request you to order only the number of badges you truly need, as issuing excess badges poses a potential security risk.
                              <br /><br />
                              Thank you for your cooperation.
                            </div>
                          </div>
                          <div className="extra-badges-form-grid">
                            <h3>Additional Badge Request</h3>
                            <div className="badge-fields-row">
                              <div className="badge-box">
                                <div className="field-row">
                                  <label htmlFor="free_badges">Free Badges:</label>
                                  <input type="number" id="free_badges" value={formData.free_badges || ""} onChange={(e) => setFormData({ ...formData, free_badges: e.target.value })} />
                                </div>
                                {!isViewOnly && (
                                  <button type="button" className="badge-update-btn" onClick={handleUpdateFreeExhibitorBadgesSubmit}>Update Free Badges</button>
                                )}
                              </div>
                              <div className="badge-box">
                                <div className="field-row">
                                  <label htmlFor="extra_badges">Extra Badges:</label>
                                  <input type="number" id="extra_badges" value={formData.extra_badges || ""} onChange={(e) => setFormData({ ...formData, extra_badges: e.target.value })} />
                                </div>
                                {!isViewOnly && (
                                  <button type="button" className="badge-update-btn" onClick={handleExhibitorBadgesSubmit}>Update Extra Badges</button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {parseInt(formData.extra_badges, 10) > 0 && (() => {
                          const count = parseInt(formData.extra_badges, 10);
                          const rate = new Date() > new Date("2026-03-21") ? 200 : 100;
                          const total = count * rate;
                          const isDelhi = formData.state?.trim().toLowerCase() === "delhi";
                          const bc = isDelhi ? total * 0.09 : 0;
                          const bs = isDelhi ? total * 0.09 : 0;
                          const bi = !isDelhi ? total * 0.18 : 0;
                          const bg = total + bc + bs + bi;
                          return (
                            <div className="badge-right exhibitor-billing-section">
                              <div className="billing-summary-wrapper">
                                <h3>Particulars</h3>
                                <div className="billing-summary-container">
                                  <div className="billing-line"><span>Extra Badges</span><span>{count}</span></div>
                                  <div className="billing-line"><span>Total Amount</span><span>₹{total.toFixed(2)}</span></div>
                                  {isDelhi ? (
                                    <>
                                      <div className="billing-line"><span>CGST (9%)</span><span>₹{bc.toFixed(2)}</span></div>
                                      <div className="billing-line"><span>SGST (9%)</span><span>₹{bs.toFixed(2)}</span></div>
                                    </>
                                  ) : (
                                    <div className="billing-line"><span>IGST (18%)</span><span>₹{bi.toFixed(2)}</span></div>
                                  )}
                                  <div className="billing-line grand-total"><span>GRAND TOTAL</span><span>₹{bg.toFixed(2)}</span></div>
                                </div>
                                <div className="billing-button-container">
                                  {isLocked && (
                                    <button type="button" className="unlock-btn" onClick={handleUnlockBadges} style={{ backgroundColor: "#2ecc71", color: "white", padding: "8px 16px", border: "none", borderRadius: "5px", marginRight: "10px", cursor: "pointer" }}>
                                      🔓 Unlock
                                    </button>
                                  )}
                                  <button type="button" className="send-mail-btn" onClick={() => handleSendMail("InOptics 2026 @ Badge Request Confirmation")} disabled={isSendingMail}>
                                    {isSendingMail ? "Sending..." : "Send Mail"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* ── APPOINTED CONTRACTOR ── */}
                  {activeNavbarItem === "APPOINTED CONTRACTOR" && (
                    <>
                      <div className="appointed-contractor-section">
                        <div className="left-column">
                          <div className="contractor-instruction-box">
                            <h3>CONTRACTORS INSTRUCTIONS</h3>
                            <p>All contractors must be registered before the deadline. ID badges must be collected prior to exhibition day. Ensure proper documentation is uploaded in the portal. Contractor undertaking form is mandatory. Follow the venue safety and conduct guidelines strictly.</p>
                            <div className="contractor-registration-line">
                              <span>Your contractor not listed? </span>
                              <button className="registration-form-btn" onClick={() => setShowRegistrationModal(true)}>Click Here</button>
                            </div>
                          </div>
                          <div className="appointed-contractor-wrapper">
                            <div className="exhibitor-cont-table-container">
                              <table className="appointed-contractor-table">
                                <thead>
                                  <tr><th>ID</th><th>Name</th><th>Company Name</th><th>City</th><th>Phn/Mob No</th><th>Email</th><th>Action</th></tr>
                                </thead>
                                <tbody>
                                  {contractorData.map((contractor, index) => (
                                    <tr key={contractor.id}>
                                      <td>{index + 1}</td><td>{contractor.name}</td><td>{contractor.company_name}</td><td>{contractor.city}</td>
                                      <td>{contractor.mobile_numbers || ""}, {contractor.phone_numbers || ""}</td>
                                      <td>{contractor.email}</td>
                                      <td>
                                        {selectedContractorId === contractor.id ? (
                                          <button className="unselect-btn" onClick={unselectContractor}>Unselect</button>
                                        ) : (
                                          <button className="select-btn" onClick={() => { selectContractor(contractor.id); setShowContractorOverlay(true); }} disabled={!!selectedContractorId}>Select</button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                        <div className="contractor-actions">
                          <h4>Booth Design</h4>
                          <p className="booth-design-instruction">
                            Please upload a high-quality image of your booth design. The image should clearly show the layout and structural details.<br />
                            <strong>Recommended dimensions:</strong> Width: <code>1200px</code>, Height: <code>800px</code>.<br />
                            Accepted formats: <code>.jpg</code>, <code>.png</code>, <code>.pdf</code>. Maximum file size: <code>5MB</code>.
                          </p>
                          <div className="booth-design-upload-section">
                            <label htmlFor="boothDesignUpload">Upload Booth Design</label>
                            <input type="file" id="boothDesignUpload" name="boothDesignUpload" disabled={!selectedContractorId} />
                          </div>
                          <div className="form-submit align-bottom">
                            <button type="submit">{showExhibitorEditForm ? "Update" : "Submit"}</button>
                          </div>
                        </div>
                      </div>

                      {showRegistrationModal && (
                        <div className="appointedcontractor-overlay-backdrop" onClick={() => setShowRegistrationModal(false)}>
                          <div className="appointedcontractor-overlay" onClick={(e) => e.stopPropagation()}>
                            <div className="appointedcontractor-overlay-header">
                              <h2>Contractor Registration Form</h2>
                              <button className="appointedcontractor-close-btn" onClick={() => setShowRegistrationModal(false)}>Close</button>
                            </div>
                            <div className="appointedcontractor-modal-content">
                              <p className="appointedcontractor-instruction-text">FOR SMOOTH AND QUICK FUNCTIONALITY PLEASE FORWARD THIS REGISTRATION FORM TO YOUR CONTRACTOR AND ASK THEM TO FILL THE FORM AND THEN SEND THE FORM TO <strong>INOPTICS@GMAIL.COM</strong></p>
                              <div className="appointedcontractor-form-line">
                                <label className="appointedcontractor-form-label">Please enter your contractor email address:</label>
                                <input type="email" className="appointedcontractor-line-input" placeholder="Enter contractor email" value={contractorEmail} onChange={(e) => setContractorEmail(e.target.value)} />
                              </div>
                              <div className="appointedcontractor-mail-preview">
                                <h4>📧 Mail Preview</h4>
                                <p><strong>To:</strong> INOPTICS@GMAIL.COM</p>
                                <p><strong>Subject:</strong> Contractor Registration Form Submission</p>
                                <p><strong>Body:</strong> Dear Team, <br /> Please find attached the contractor registration form for approval.</p>
                              </div>
                              <div className="appointedcontractor-action-buttons">
                                {coreFormData.length > 0 && (
                                  <a href={`https://inoptics.in/api/uploads/${encodeURIComponent(coreFormData.find((form) => form.category?.toLowerCase().includes("contractor undertaking-declaration & registration"))?.filename || "")}`} target="_blank" rel="noopener noreferrer" className="appointedcontractor-view-btn">View Form</a>
                                )}
                                <button className="appointedcontractor-send-btn" onClick={() => handleSendRegistrationMail(contractorEmail)}>Send Mail</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {showContractorOverlay && (
                        <div className="contractor-overlay-backdrop" onClick={() => setShowContractorOverlay(false)}>
                          <div className="contractor-overlay" onClick={(e) => e.stopPropagation()}>
                            <div className="contractor-overlay-header">
                              <h2>Mandatory Required Information</h2>
                              <button className="contractor-close-btn" onClick={() => setShowContractorOverlay(false)}>Close</button>
                            </div>
                            <h3 className="contractor-subheading">Please follow it carefully</h3>
                            <div className="contractor-instruction-box-modal">
                              <h4>Instruction</h4>
                              <ol>
                                <li>Click here to <strong>Send the Undertaking Form</strong> to your selected contractor.</li>
                                <li>FOR SMOOTH AND QUICK FUNCTIONALITY PLEASE FORWARD THIS UNDERTAKING FORM TO YOUR CONTRACTOR AND ASK THEM TO FILL THE FORM AND THEN SEND THE FORM TO <strong>INOPTICS@GMAIL.COM</strong></li>
                                <li>
                                  <strong>Set-Up & dismantling timetable</strong><br /><br />
                                  <strong>Set up:</strong><br />
                                  ➤ Bare space: from 25/03/2026, 4:00 PM to 27/03/2026, 4:00 PM<br />
                                  ➤ Shell scheme: from 26/03/2026, 4:00 PM to 27/03/2026, 4:00 PM<br /><br />
                                  <strong>Dismantling:</strong><br />
                                  ➤ Bare space: from 30/03/2026, 4:30 PM to 30/03/2026, 12:00 MIDNIGHT<br />
                                  ➤ Shell scheme: from 30/03/2026, 4:30 PM to 30/03/2026, 9:00 PM
                                </li>
                                <li>Booth Design is also mandatory to be uploaded for approval with proper instruction given in the Booth Design space.</li>
                                <li>After receiving the form, read it carefully. It should be filled by the contractor and then e-mail that form like this:</li>
                              </ol>
                              <div className="appointedcontractor-mail-preview">
                                <h4>📧 Mail Preview</h4>
                                <p><strong>To:</strong> INOPTICS@GMAIL.COM</p>
                                <p><strong>Subject:</strong> Contractor Registration Form Submission</p>
                                <p><strong>Body:</strong> Dear Team, <br /> Please find attached the contractor registration form for approval.</p>
                              </div>
                              <div className="appointedcontractor-action-buttons">
                                {coreFormData.length > 0 && (
                                  <a href={`https://inoptics.in/api/uploads/${encodeURIComponent(coreFormData.find((form) => form.category?.toLowerCase().includes("contractor undertaking-declaration & registration"))?.filename || "")}`} target="_blank" rel="noopener noreferrer" className="appointedcontractor-view-btn">View Form</a>
                                )}
                                <button className="appointedcontractor-send-btn" onClick={() => handleSendRegistrationMail(contractorEmail)}>Send Mail</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* ── EXTRA FURNITURE REQUIREMENT ── */}
                  {activeNavbarItem === "EXTRA FURNITURE REQUIREMENT" && (
                    <>
                      {showFurnitureList && (
                        <div className="exhibitor-extra-furniture-modal-overlay">
                          <div className="exhibitor-extra-furniture-modal-content-table">
                            <div className="exhibitor-extra-furniture-modal-header">
                              <h2>Furniture List</h2>
                              <button className="exhibitor-extra-furniture-close-btn" onClick={() => setShowFurnitureList(false)}>×</button>
                            </div>
                            <div className="exhibitor-extra-furniture-scrollable-body">
                              <div className="exhibitor-extra-furniture-grid">
                                {furnitureData.map((item) => (
                                  <div key={item.id} className="furniture-card">
                                    <img src={`https://www.inoptics.in/api/uploads/${item.image}`} alt={item.name} className="furniture-card-img" />
                                    <div className="furniture-card-name">{item.name}</div>
                                    <div className="furniture-card-price">₹{item.price}</div>
                                    {selectedFurniture.find((f) => f.id === item.id) ? (
                                      <button style={{ backgroundColor: "#4caf50", cursor: "default" }} disabled>Selected</button>
                                    ) : (
                                      <button onClick={() => setSelectedFurniture([...selectedFurniture, { ...item, quantity: 1 }])}>Select</button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div style={{ display: "flex", gap: "60px", alignItems: "flex-start" }}>
                        <div className="selected-furniture-table-wrapper">
                          <table className="selected-furniture-table">
                            <colgroup>
                              <col style={{ width: "40px" }} /><col style={{ width: "120px" }} /><col style={{ width: "180px" }} />
                              <col style={{ width: "100px" }} /><col style={{ width: "100px" }} /><col style={{ width: "100px" }} /><col style={{ width: "100px" }} />
                            </colgroup>
                            <thead><tr><th>ID</th><th>Image</th><th>Name</th><th>Price</th><th>Quantity</th><th>Total</th><th>Action</th></tr></thead>
                            <tbody>
                              {selectedFurniture.length > 0 ? selectedFurniture.map((item, index) => (
                                <tr key={item.id}>
                                  <td>{index + 1}</td>
                                  <td><img src={`https://www.inoptics.in/api/uploads/${item.image}`} alt={item.name} width="100" height="100" style={{ objectFit: "cover" }} /></td>
                                  <td>{item.name}</td>
                                  <td>₹{item.price}</td>
                                  <td><input type="number" min="1" value={item.quantity || ""} onChange={(e) => handleQuantityChange(index, e.target.value)} style={{ width: "60px" }} /></td>
                                  <td>₹{item.quantity ? (item.quantity * item.price).toFixed(2) : "0.00"}</td>
                                  <td><button onClick={() => setSelectedFurniture(selectedFurniture.filter((_, i) => i !== index))}>Delete</button></td>
                                </tr>
                              )) : (
                                <tr><td colSpan="7" style={{ textAlign: "center", padding: "10px" }}>No furniture selected yet.</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        <div className="extra-furniture-billing-section" style={{ width: "27%" }}>
                          <div className="furniture-extra-action-button">
                            <div className="extra-furniture-add-button">
                              <button onClick={() => setShowFurnitureList(!showFurnitureList)}>Add Extra Furniture</button>
                            </div>
                            <div className="extra-furniture-billing-submit" style={{ display: "flex", gap: "10px" }}>
                              <button onClick={() => {
                                const companyName = formData.company_name || "Unknown Company";
                                const payload = { company_name: companyName, furniture: selectedFurniture.map((item) => ({ image: item.image, name: item.name, price: item.price, quantity: item.quantity, total: item.quantity * item.price })) };
                                addExhibitorSelectedFurniture(payload);
                                updateSelectedFurniture(companyName, selectedFurniture).then(() => setSelectedFurniture([])).catch((err) => console.error("Update failed:", err));
                              }}>
                                {showExhibitorEditForm ? "Update" : "Submit"}
                              </button>
                              {lockState.is_locked === 1 && (
                                <button style={{ backgroundColor: "#f44336", color: "#fff" }} onClick={() => handleAdminUnlock(formData.company_name)}>Unlock</button>
                              )}
                            </div>
                          </div>

                          <h3>Particulars</h3>
                          <div style={{ fontSize: "15px", lineHeight: "1.8", fontFamily: "Segoe UI" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Total</span><span>₹{furnitureBilling.amount?.toFixed(2) || "0.00"}</span></div>
                            {formData.state?.toLowerCase() === "delhi" ? (
                              <>
                                <div style={{ display: "flex", justifyContent: "space-between" }}><span>CGST (9%)</span><span>₹{furnitureBilling.cgst?.toFixed(2) || "0.00"}</span></div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}><span>SGST (9%)</span><span>₹{furnitureBilling.sgst?.toFixed(2) || "0.00"}</span></div>
                              </>
                            ) : (
                              <div style={{ display: "flex", justifyContent: "space-between" }}><span>IGST (18%)</span><span>₹{furnitureBilling.igst?.toFixed(2) || "0.00"}</span></div>
                            )}
                            <hr style={{ margin: "15px 0" }} />
                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}><span>GRAND TOTAL</span><span>₹{furnitureBilling.grandTotal?.toFixed(2) || "0.00"}</span></div>
                          </div>

                          <div className="Extra-Furniture-Instruction">
                            <div className="admin-vendor-wrapper">
                              {furnitureVendorDetails.length > 0 ? furnitureVendorDetails.map((vendor) => (
                                <div key={vendor.id} className="admin-vendor-card">
                                  <div className="admin-vendor-row"><div className="admin-vendor-label">Vendor Name :</div><div className="admin-vendor-value">{vendor.vendor_name}</div></div>
                                  <div className="admin-vendor-row"><div className="admin-vendor-label">Company Name :</div><div className="admin-vendor-value">{vendor.company_name}</div></div>
                                  <div className="admin-vendor-row"><div className="admin-vendor-label">Email :</div><div className="admin-vendor-value">{vendor.email}</div></div>
                                  <div className="admin-vendor-row"><div className="admin-vendor-label">Contact No :</div><div className="admin-vendor-value">{vendor.contact_number}</div></div>
                                </div>
                              )) : <p className="admin-vendor-empty">No vendors found</p>}
                            </div>
                            <div className="billing-button-container">
                              <button type="button" className="send-mail-btn" onClick={() => handleSendFurnitureMail("InOptics 2026 @ Extra Furniture Request Confirmation")} disabled={isSendingMail}>
                                {isSendingMail ? "Sending..." : "Send Mail"}
                              </button>
                              {isSendingMail && <div className="waiting-overlay"><div className="waiting-loader"></div><p>Sending mail, please wait...</p></div>}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ── PAYMENT DETAILS ── */}
                  {activeNavbarItem === "PAYMENT DETAILS" && (
                    <div className="payment-details-form slide-up-form">
                      <div className="details-container">
                        <div className="company-details-box">
                          <h2 className="payment-details-form-heading">Company Details</h2>
                          <div className="company-details-grid">
                            <div className="row"><label><strong>Company Name:</strong> {formData.company_name}</label><label><strong>Address:</strong> {formData.address}</label></div>
                            <div className="row"><label><strong>City:</strong> {formData.city}</label><label><strong>State:</strong> {formData.state}</label></div>
                            <div className="row"><label><strong>Pincode:</strong> {formData.pin}</label><label><strong>Mobile:</strong> {formData.mobile}</label></div>
                            <div className="row"><label><strong>Email:</strong> {formData.email}</label><label><strong>GST:</strong> {formData.gst}</label></div>
                          </div>
                        </div>
                        <div className="booth-details-box">
                          <h2 className="payment-details-form-heading">Booth Details</h2>
                          {stallList.length > 1 ? (
                            <table className="booth-details-table">
                              <thead><tr><th>Stall No</th><th>Category</th><th>Area</th></tr></thead>
                              <tbody>
                                {stallList.map((stall, idx) => {
                                  let areaValue = stall.stall_area;
                                  if (areaValue !== null && areaValue !== undefined && areaValue !== "") {
                                    const num = parseFloat(areaValue);
                                    if (!isNaN(num)) areaValue = `${Number.isInteger(num) ? num : num.toFixed(2)} sq mtr`;
                                  } else { areaValue = "N/A"; }
                                  return <tr key={idx}><td>{stall.stall_number}</td><td>{stall.stall_category}</td><td>{areaValue}</td></tr>;
                                })}
                              </tbody>
                            </table>
                          ) : (
                            <div className="payment-details-label-group">
                              <label><strong>Stall No:</strong> {stallList[0]?.stall_number || "N/A"}</label>
                              <label><strong>Stall Category:</strong> {stallList[0]?.stall_category || "N/A"}</label>
                              <label><strong>Stall Area:</strong> {(() => { const a = stallList[0]?.stall_area; if (a != null && a !== "") { const n = parseFloat(a); if (!isNaN(n)) return `${Number.isInteger(n) ? n : n.toFixed(2)} sq mtr`; } return "N/A"; })()}</label>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="payment-cards-container">
                        <h2 className="payment-details-form-heading">PAYMENT DETAILS</h2>
                        <div className="payment-card-grid">
                          {/* Stall Card */}
                          <div className="payment-card">
                            <h4>Stall Particulars</h4>
                            <div className="billing-summary">
                              <div className="billing-row"><span>Total:</span><strong>{stallSummary.total?.toFixed(2)} {stallSummary.currency}</strong></div>
                              {stallSummary.discounted_amount > 0 && <div className="billing-row"><span>Discount ({getDiscountPercent(stallSummary)}%):</span><strong>{stallSummary.discounted_amount?.toFixed(2)} {stallSummary.currency}</strong></div>}
                              {formData?.state?.toLowerCase() === "delhi" ? (
                                <><div className="billing-row"><span>SGST (9%):</span><strong>{stallSummary.sgst?.toFixed(2)} {stallSummary.currency}</strong></div><div className="billing-row"><span>CGST (9%):</span><strong>{stallSummary.cgst?.toFixed(2)} {stallSummary.currency}</strong></div></>
                              ) : <div className="billing-row"><span>IGST (18%):</span><strong>{stallSummary.igst?.toFixed(2)} {stallSummary.currency}</strong></div>}
                              <div className="billing-row total"><span>Grand Total:</span><strong>{stallSummary.grand_total?.toFixed(2)} {stallSummary.currency}</strong></div>
                              {pendingAmount !== null && <div className="billing-row" style={{ color: pendingAmount <= 0 ? "green" : "red", fontWeight: "bold", marginTop: "10px" }}><span>{pendingAmount <= 0 ? "PAYMENT CLEARED" : "PENDING AMOUNT"}</span><strong>{pendingAmount.toFixed(2)} {stallSummary.currency}</strong></div>}
                            </div>
                            <div style={{ alignSelf: "flex-end", marginTop: "auto" }}>
                              <button className="card-pay-now-btn" onClick={() => { setSelectedStallIndex(0); setActiveOverlay("stall"); }}>Add Payment</button>
                            </div>
                          </div>
                          {/* Power Card */}
                          <div className="payment-card">
                            <h4>Power Requirement</h4>
                            <div className="billing-summary">
                              <div className="billing-row"><span>Total:</span><strong>{totalPrice.toFixed(2)} ₹</strong></div>
                              {formData?.state?.toLowerCase() === "delhi" ? (
                                <><div className="billing-row"><span>CGST (9%):</span><strong>{cgst.toFixed(2)} ₹</strong></div><div className="billing-row"><span>SGST (9%):</span><strong>{sgst.toFixed(2)} ₹</strong></div></>
                              ) : <div className="billing-row"><span>IGST (18%):</span><strong>{igst.toFixed(2)} ₹</strong></div>}
                              <div className="billing-row total"><span>Grand Total:</span><strong>{grandTotal.toFixed(2)} ₹</strong></div>
                              {powerPendingAmount !== null && <div className="billing-row" style={{ color: powerPendingAmount <= 0 ? "green" : "red", fontWeight: "bold", marginTop: "10px" }}><span>{powerPendingAmount <= 0 ? "PAYMENT CLEARED" : "PENDING AMOUNT"}</span><strong>{powerPendingAmount.toFixed(2)} ₹</strong></div>}
                            </div>
                            <div style={{ alignSelf: "flex-end", marginTop: "auto" }}>
                              <button className="card-pay-now-btn" onClick={() => setActiveOverlay("power")}>Add Payment</button>
                            </div>
                          </div>
                          {/* Badges Card */}
                          {(() => {
                            const { count, total: bt, cgst: bc, sgst: bs, igst: bi, grandTotal: bg } = getExhibitorBadgeBilling();
                            return (
                              <div className="payment-card">
                                <h4>Exhibitor Badges</h4>
                                <div className="billing-summary">
                                  <div className="billing-row"><span>Extra Badges:</span><strong>{count || 0}</strong></div>
                                  <div className="billing-row"><span>Total Amount:</span><strong>₹{bt?.toFixed(2) || "0.00"}</strong></div>
                                  {formData?.state?.toLowerCase() === "delhi" ? (
                                    <><div className="billing-row"><span>CGST (9%):</span><strong>₹{bc?.toFixed(2) || "0.00"}</strong></div><div className="billing-row"><span>SGST (9%):</span><strong>₹{bs?.toFixed(2) || "0.00"}</strong></div></>
                                  ) : <div className="billing-row"><span>IGST (18%):</span><strong>₹{bi?.toFixed(2) || "0.00"}</strong></div>}
                                  <div className="billing-row total"><span>Grand Total:</span><strong>₹{bg?.toFixed(2) || "0.00"}</strong></div>
                                </div>
                                <div style={{ alignSelf: "flex-end", marginTop: "auto" }}>
                                  <button className="card-pay-now-btn" onClick={() => setActiveOverlay("badges")}>Add Payment</button>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Payment Overlay Panel */}
                      {activePaymentDetailsOverlay && (
                        <div className="payment-overlay-backdrop">
                          <div className="PaymentDetails-overlay-panel">
                            <div className="PaymentDetails-overlay-header">
                              <h3>{activePaymentDetailsOverlay === "stall" ? "Stall Payment" : activePaymentDetailsOverlay === "power" ? "Power Payment" : "Exhibitor Badges Payment"}</h3>
                              <div className="payment-header-actions">
                                {(activePaymentDetailsOverlay === "stall" || activePaymentDetailsOverlay === "power") && (
                                  <button className="payment-details-add-payment-btn small" onClick={() => {
                                    if (activePaymentDetailsOverlay === "stall") {
                                      const stall = stallList[selectedStallIndex];
                                      setFormTemplateData({ recipient: formData.company_name, address1: formData.address, receiverEmail: formData.email, stateCity: `${formData.state}, ${formData.city}`, pincode: stall?.pin || formData.pin, senderState: activeAddress?.data?.state, discount: stall?.discounted_amount || 0, discountPercent: stall?.discount_percent || 0 });
                                    } else {
                                      setFormTemplateData({ recipient: formData.company_name, address1: formData.address, receiverEmail: formData.email, stateCity: `${formData.state}, ${formData.city}`, pincode: formData.pin, senderState: activeAddress?.data?.state, discount: 0, discountPercent: 0 });
                                    }
                                    setInvoiceOverlayVisible(true);
                                  }}>Proforma Invoice</button>
                                )}
                                <button className="payment-header-close-btn" onClick={() => setActiveOverlay(null)}>Close</button>
                              </div>
                            </div>

                            {/* Stall Payment */}
                            {activePaymentDetailsOverlay === "stall" && selectedStallIndex !== null && (() => {
                              const stall = stallList[selectedStallIndex];
                              if (!stall) return <p>No stall data found.</p>;
                              const totalPaidWithTDS = payments.reduce((sum, pay) => sum + parseFloat(pay.amount || pay.amount_paid || 0) + parseFloat(pay.tds || 0), 0);
                              const gt = stallList.length > 1 ? parseFloat(stallSummary.grand_total || 0) : parseFloat(stall.grand_total || 0);
                              const pending = gt - totalPaidWithTDS;
                              return (
                                <>
                                  <div className="payment-billing-flex-wrapper">
                                    <div className="stallpayment-billing-details">
                                      <h3>Particulars</h3>
                                      {stallList.length > 1 ? (
                                        <table className="stall-booth-details-table">
                                          <thead><tr><th>Stall No</th><th>Category</th><th>Area</th><th>Price (per sq.mtrs)</th><th>Total</th></tr></thead>
                                          <tbody>
                                            {stallList.map((s, idx) => (
                                              <tr key={idx}>
                                                <td>{s.stall_number || "-"}</td><td>{s.stall_category || "-"}</td>
                                                <td>{s.stall_area ? `${parseFloat(s.stall_area).toFixed(0)} sq mtr` : "-"}</td>
                                                <td>{s.stall_price || "-"} {s.currency || ""}</td>
                                                <td>{((parseFloat(s.stall_area) || 0) * (parseFloat(s.stall_price) || 0)).toFixed(2)}</td>
                                              </tr>
                                            ))}
                                            <tr className="grand-total-row" style={{ fontWeight: "bold", background: "#f1f1f1" }}>
                                              <td colSpan={4} style={{ textAlign: "right" }}>Total</td>
                                              <td>{stallList.reduce((sum, s) => sum + parseFloat(s.stall_area || 0) * parseFloat(s.stall_price || 0), 0).toFixed(2)}</td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      ) : (
                                        <>
                                          <div className="billing-row"><span>Stall Number:</span><strong>{stall.stall_number || "-"}</strong></div>
                                          <div className="billing-row"><span>Hall Number:</span><strong>{stall.hall_number || "-"}</strong></div>
                                          <div className="billing-row"><span>Stall Category:</span><strong>{stall.stall_category || "-"}</strong></div>
                                          <div className="billing-row"><span>Stall Area:</span><strong>{stall.stall_area ? `${parseFloat(stall.stall_area).toFixed(0)} sq mtr` : "-"}</strong></div>
                                          <div className="billing-row"><span>Stall Price (per sq mtrs):</span><strong>{stall.stall_price || "-"} {stall.currency || ""}</strong></div>
                                          <div className="billing-row"><span>Total:</span><strong>{((parseFloat(stall.stall_area || 0) * parseFloat(stall.stall_price || 0)) || 0).toFixed(2)} {stall.currency}</strong></div>
                                        </>
                                      )}
                                      <h3>Billing Details</h3>
                                      {stallList.length > 1 ? (
                                        <>
                                          <div className="billing-row"><span>Total:</span><strong>{stallSummary.total?.toFixed(2)} {stallSummary.currency}</strong></div>
                                          {stallSummary.discounted_amount > 0 && <div className="billing-row"><span>Discount ({getDiscountPercent(stallSummary)}%):</span><strong>{stallSummary.discounted_amount?.toFixed(2)} {stallSummary.currency}</strong></div>}
                                          {stallSummary.discounted_amount > 0 && <div className="billing-row"><span>Total After Discount:</span><strong>{(stallSummary.total - stallSummary.discounted_amount).toFixed(2)} {stallSummary.currency}</strong></div>}
                                          {formData.state?.toLowerCase() === "delhi" ? (
                                            <><div className="billing-row"><span>SGST (9%):</span><strong>{stallSummary.sgst?.toFixed(2)} {stallSummary.currency}</strong></div><div className="billing-row"><span>CGST (9%):</span><strong>{stallSummary.cgst?.toFixed(2)} {stallSummary.currency}</strong></div></>
                                          ) : <div className="billing-row"><span>IGST (18%):</span><strong>{stallSummary.igst?.toFixed(2)} {stallSummary.currency}</strong></div>}
                                          <div className="billing-row total"><span>Grand Total:</span><strong>{stallSummary.grand_total?.toFixed(2)} {stallSummary.currency}</strong></div>
                                        </>
                                      ) : (
                                        <>
                                          <div className="billing-row"><span>Total:</span><strong>{stall.total || "0.00"} {stall.currency}</strong></div>
                                          {stall.discount_percent && parseFloat(stall.discount_percent) > 0 && (
                                            <>
                                              <div className="billing-row"><span>Discount ({stall.discount_percent}%):</span><strong>{stall.discounted_amount} {stall.currency}</strong></div>
                                              <div className="billing-row"><span>Total After Discount:</span><strong>{(parseFloat(stall.total || 0) - parseFloat(stall.discounted_amount || 0)).toFixed(2)} {stall.currency}</strong></div>
                                            </>
                                          )}
                                          {formData.state?.toLowerCase() === "delhi" ? (
                                            <><div className="billing-row"><span>SGST (9%):</span><strong>{stall.sgst_9_percent || "0.00"} {stall.currency}</strong></div><div className="billing-row"><span>CGST (9%):</span><strong>{stall.cgst_9_percent || "0.00"} {stall.currency}</strong></div></>
                                          ) : <div className="billing-row"><span>IGST (18%):</span><strong>{stall.igst_18_percent || "0.00"} {stall.currency}</strong></div>}
                                          <div className="billing-row total"><span>Grand Total:</span><strong>{stall.grand_total || "0.00"} {stall.currency}</strong></div>
                                        </>
                                      )}
                                      {payments.length > 0 && (
                                        <div style={{ marginTop: "16px" }}>
                                          {payments.map((pay, index) => {
                                            const a = parseFloat(pay.amount || pay.amount_paid || 0);
                                            const t = parseFloat(pay.tds || 0);
                                            return (
                                              <div key={index} style={{ marginBottom: "8px" }}>
                                                <div className="billing-row"><span>Payment {index + 1}:</span><strong>{a.toFixed(2)} {stall.currency}</strong></div>
                                                <div className="billing-row"><span>TDS {index + 1}:</span><strong>{t.toFixed(2)} {stall.currency}</strong></div>
                                              </div>
                                            );
                                          })}
                                          <hr style={{ borderTop: "1px dashed #999", margin: "12px 0" }} />
                                          <div className="billing-row total"><span>Total Payment After TDS:</span><strong>{totalPaymentWithTDS?.toFixed(2)} {stall.currency}</strong></div>
                                          <div className="billing-row total" style={{ color: pending <= 0 ? "green" : "red", fontWeight: "bold" }}>
                                            <span>{pending <= 0 ? "PAYMENT CLEARED" : "PENDING AMOUNT"}</span>
                                            <strong>{pending > 0 ? `${pending.toFixed(2)} ${stall.currency}` : `0.00 ${stall.currency}`}</strong>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                    {/* Stall Payment Form */}
                                    <div className="new-payment-form-section">
                                      <h2 className="payment-details-form-heading">Payment Details</h2>
                                      <div className="new-payment-form-grid">
                                        <div className="new-payment-form-row">
                                          <div className="new-payment-input-group"><label className="new-payment-inputlabel">Payment Type:</label><input className="new-payment-inputbox" type="text" placeholder="CHQ/NEFT/IMPS" value={paymentType} onChange={(e) => setPaymentType(e.target.value)} /></div>
                                          <div className="new-payment-input-group"><label className="new-payment-inputlabel">Payment Date:</label><input className="new-payment-inputbox" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} /></div>
                                        </div>
                                        <div className="new-payment-form-row">
                                          <div className="new-payment-input-group"><label className="new-payment-inputlabel">Name of Exhibitor Bank:</label><input className="new-payment-inputbox" type="text" placeholder="Exhibitor Bank Name" value={exhibitorBankName} onChange={(e) => setExhibitorBankName(e.target.value)} /></div>
                                          <div className="new-payment-input-group"><label className="new-payment-inputlabel">Name of Receiver Bank:</label><input className="new-payment-inputbox" type="text" placeholder="Receiver Bank Name" value={receiverBankName} onChange={(e) => setReceiverBankName(e.target.value)} /></div>
                                        </div>
                                        <div className="new-payment-form-row">
                                          <div className="new-payment-input-group"><label className="new-payment-inputlabel">Amount:</label><input className="new-payment-inputbox" type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
                                          <div className="new-payment-input-group"><label className="new-payment-inputlabel">TDS:</label><input className="new-payment-inputbox" type="number" placeholder="TDS" value={tds} onChange={(e) => setTds(e.target.value)} /></div>
                                        </div>
                                        <div className="new-payment-form-row button-row">
                                          <div className="new-payment-add-button-inline">
                                            {editingIndex === null
                                              ? <button className="new-payment-add-btn" onClick={handleAddPayment}>Add Payment</button>
                                              : <button className="new-payment-update-btn" onClick={handleUpdatePayment}>Update Payment</button>}
                                          </div>
                                        </div>
                                        <div className="remark-section">
                                          <textarea style={{ width: "100%" }} className="remark-textarea" placeholder="Enter remark here..." disabled={!editingRemarkId && remarkSaved} value={remarkText} onChange={(e) => setRemarkText(e.target.value)} rows={2} />
                                          <div className="remark-button-row">
                                            {remarkSaved && <button className="remark-send-btn" onClick={handleSendEmail}>Send Email</button>}
                                            {!remarkSaved
                                              ? <button className="remark-save-btn" onClick={handleSaveRemark}>Save Remark</button>
                                              : <button className="remark-edit-btn" onClick={handleUpdateCompanyRemark}>update Remark</button>}
                                          </div>
                                          {companyRemarks.length > 0 && (
                                            <div className="company-remarks-list">
                                              <h3 style={{ marginTop: "15px" }}>Previous Remarks</h3>
                                              {companyRemarks.map((item) => (
                                                <div key={item.id} className="remark-history-box">
                                                  <div className="remark-content"><p>{item.remark}</p></div>
                                                  <div className="remark-actions">
                                                    <span className="remark-edit-icon" onClick={() => handleEditCompanyRemark(item)}>✏️</span>
                                                    <span className="remark-delete-icon" onClick={() => handleDeleteCompanyRemark(item.id)}>🗑</span>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="payment-main-row">
                                    <div className="added-payments-section full-width">
                                      <h2 className="payment-details-form-heading">Added Payments</h2>
                                      {payments.length === 0 ? <p style={{ padding: "8px 0" }}>No payment records added yet.</p> : (
                                        <div className="payment-table-container">
                                          <table className="payment-details-table">
                                            <thead><tr><th>Payment Type</th><th>Payment Date</th><th>Exhibitor Bank</th><th>Receiver Bank</th><th>Received Payment</th><th>TDS</th><th>Action</th></tr></thead>
                                            <tbody>
                                              {payments.map((pay, index) => (
                                                <tr key={index}>
                                                  <td>{pay.type || pay.payment_type}</td><td>{pay.date || pay.payment_date}</td>
                                                  <td>{pay.exhibitorBank || pay.name_of_exhibitor_bank}</td><td>{pay.receiverBank || pay.name_of_receiver_bank}</td>
                                                  <td>{pay.amount || pay.amount_paid}</td><td>{pay.tds || "0.00"}</td>
                                                  <td>
                                                    <button onClick={() => handleEditPayment(index)} className="payment-edit-btn-table">Edit</button>
                                                    <button onClick={() => handleDeletePayment(index)} className="payment-delete-btn-table">Delete</button>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </>
                              );
                            })()}

                            {/* Power Payment */}
                            {activePaymentDetailsOverlay === "power" && (
                              <>
                                <div className="payment-billing-flex-wrapper">
                                  <div className="powerpayment-billing-details">
                                    <h3>Power Billing Details</h3>
                                    {exhibitorPreviewList.map((item, index) => (
                                      <div key={index} className="power-billing-entry">
                                        <h4>{index + 1}. {item.day}</h4>
                                        <div className="billing-row"><span>Price per KW:</span><strong>{item.pricePerKw} ₹</strong></div>
                                        <div className="billing-row"><span>Power Required:</span><strong>{item.powerRequired} unit</strong></div>
                                        <div className="billing-row"><span>Total Amount:</span><strong>{item.totalAmount} ₹</strong></div>
                                      </div>
                                    ))}
                                    <hr />
                                    <div className="billing-row total"><span>Total Price:</span><strong>{totalPrice.toFixed(2)} ₹</strong></div>
                                    {formData.state?.toLowerCase() === "delhi" ? (
                                      <><div className="billing-row"><span>SGST (9%):</span><strong>{sgst.toFixed(2)} ₹</strong></div><div className="billing-row"><span>CGST (9%):</span><strong>{cgst.toFixed(2)} ₹</strong></div></>
                                    ) : <div className="billing-row"><span>IGST (18%):</span><strong>{igst.toFixed(2)} ₹</strong></div>}
                                    <div className="billing-row total"><span>Grand Total:</span><strong>{grandTotal.toFixed(2)} ₹</strong></div>
                                    {powerPayments.length > 0 && (
                                      <div style={{ marginTop: "16px" }}>
                                        {powerPayments.map((pay, index) => {
                                          const a = parseFloat(pay.amount || 0);
                                          const t = parseFloat(pay.tds || 0);
                                          return <div className="billing-row" key={index}><span>Payment {index + 1}: {t > 0 ? "Amount Paid + TDS" : "Amount Paid"}</span><strong>{(a + t).toFixed(2)} ₹</strong></div>;
                                        })}
                                        <hr style={{ borderTop: "1px dashed #999", margin: "10px 0" }} />
                                        <div className="billing-row" style={{ color: powerPendingAmount <= 0 ? "green" : "red", fontWeight: "bold" }}>
                                          <span>{powerPendingAmount <= 0 ? "PAYMENT CLEARED" : "PENDING AMOUNT"}</span>
                                          <strong>{powerPendingAmount > 0 ? `${powerPendingAmount.toFixed(2)} ₹` : "0.00 ₹"}</strong>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="new-payment-form-section">
                                    <h2 className="payment-details-form-heading">Payment Details</h2>
                                    <div className="new-payment-form-grid">
                                      <div className="new-payment-form-row">
                                        <div className="new-payment-input-group"><label className="new-payment-inputlabel">Payment Type:</label><input className="new-payment-inputbox" type="text" placeholder="CHQ/NEFT/IMPS" value={powerPaymentType} onChange={(e) => setPowerPaymentType(e.target.value)} /></div>
                                        <div className="new-payment-input-group"><label className="new-payment-inputlabel">Payment Date:</label><input className="new-payment-inputbox" type="date" value={powerPaymentDate} onChange={(e) => setPowerPaymentDate(e.target.value)} /></div>
                                      </div>
                                      <div className="new-payment-form-row">
                                        <div className="new-payment-input-group"><label className="new-payment-inputlabel">Name of Exhibitor Bank:</label><input className="new-payment-inputbox" type="text" placeholder="Exhibitor Bank Name" value={powerExhibitorBankName} onChange={(e) => setPowerExhibitorBankName(e.target.value)} /></div>
                                        <div className="new-payment-input-group"><label className="new-payment-inputlabel">Name of Receiver Bank:</label><input className="new-payment-inputbox" type="text" placeholder="Receiver Bank Name" value={powerReceiverBankName} onChange={(e) => setPowerReceiverBankName(e.target.value)} /></div>
                                      </div>
                                      <div className="new-payment-form-row">
                                        <div className="new-payment-input-group"><label className="new-payment-inputlabel">Amount:</label><input className="new-payment-inputbox" type="number" placeholder="Amount" value={powerAmount} onChange={(e) => setPowerAmount(e.target.value)} /></div>
                                        <div className="new-payment-input-group"><label className="new-payment-inputlabel">TDS:</label><input className="new-payment-inputbox" type="number" placeholder="TDS" value={powerTds} onChange={(e) => setPowerTds(e.target.value)} /></div>
                                      </div>
                                      <div className="new-payment-form-row button-row">
                                        <div className="new-payment-add-button-inline">
                                          {editingPowerIndex === null
                                            ? <button className="new-payment-add-btn" onClick={handleAddPowerPayment}>Add Payment</button>
                                            : <button className="new-payment-update-btn" onClick={handleUpdatePowerPayment}>Update Payment</button>}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="payment-main-row">
                                  <div className="added-payments-section full-width">
                                    <h2 className="payment-details-form-heading">Added Payments</h2>
                                    {powerPayments.length === 0 ? <p style={{ padding: "8px 0" }}>No payment records added yet.</p> : (
                                      <div className="payment-table-container">
                                        <table className="payment-details-table">
                                          <thead><tr><th>Payment Type</th><th>Payment Date</th><th>Exhibitor Bank</th><th>Receiver Bank</th><th>Received Payment</th><th>TDS</th><th>Action</th></tr></thead>
                                          <tbody>
                                            {powerPayments.map((pay, index) => (
                                              <tr key={index}>
                                                <td>{pay.type}</td><td>{pay.date}</td><td>{pay.exhibitorBank}</td><td>{pay.receiverBank}</td><td>{pay.amount}</td><td>{pay.tds}</td>
                                                <td>
                                                  <button onClick={() => handleEditPowerPayment(index)} className="payment-edit-btn-table">Edit</button>
                                                  <button onClick={() => handleDeletePowerPayment(index)} className="payment-delete-btn-table">Delete</button>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Badge Payment */}
                            {activePaymentDetailsOverlay === "badges" && (
                              <>
                                <div className="payment-billing-flex-wrapper">
                                  <div className="badgepayment-billing-details">
                                    <div className="badges-instruction-box">
                                      <div className="instruction-text"><br /><br />As per your stall size, you will receive <strong>{formData.free_badges || 0}</strong> complimentary badge{formData.free_badges === 1 ? "" : "s"} for the exhibition.<br /></div>
                                    </div>
                                    <div className="exhibitor-billing-section">
                                      <h3>Exhibitor Extra Badges Billing</h3>
                                      {parseInt(formData.extra_badges, 10) > 0 ? (() => {
                                        const { count, total: bt, cgst: bc, sgst: bs, igst: bi, grandTotal: bg } = getExhibitorBadgeBilling();
                                        const totalPaidWithTDS = badgePayments.reduce((sum, pay) => sum + parseFloat(pay.amount || 0) + parseFloat(pay.tds || 0), 0);
                                        const badgePending = bg - totalPaidWithTDS;
                                        return (
                                          <div className="billing-summary-wrapper">
                                            <div className="billing-summary-container">
                                              <div className="billing-line"><span>Extra Badges</span><span>{count}</span></div>
                                              <div className="billing-line"><span>Total Amount</span><span>₹{bt?.toFixed(2)}</span></div>
                                              {formData.state?.toLowerCase() === "delhi" ? (
                                                <><div className="billing-line"><span>CGST (9%)</span><span>₹{bc?.toFixed(2)}</span></div><div className="billing-line"><span>SGST (9%)</span><span>₹{bs?.toFixed(2)}</span></div></>
                                              ) : <div className="billing-line"><span>IGST (18%)</span><span>₹{bi?.toFixed(2)}</span></div>}
                                              <div className="billing-line grand-total"><span>GRAND TOTAL</span><span>₹{bg?.toFixed(2)}</span></div>
                                              {badgePayments.length > 0 && (
                                                <div style={{ marginTop: "16px" }}>
                                                  {badgePayments.map((pay, index) => {
                                                    const a = parseFloat(pay.amount || 0);
                                                    const t = parseFloat(pay.tds || 0);
                                                    return <div className="billing-row" key={index}><span>Payment {index + 1}: {t > 0 ? "Amount Paid + TDS" : "Amount Paid"}</span><strong>₹{(a + t).toFixed(2)}</strong></div>;
                                                  })}
                                                  <hr style={{ borderTop: "1px dashed #999", margin: "10px 0" }} />
                                                  <div className="billing-row" style={{ color: badgePending <= 0 ? "green" : "red", fontWeight: "bold" }}>
                                                    <span>{badgePending <= 0 ? "PAYMENT CLEARED" : "PENDING AMOUNT"}</span>
                                                    <strong>{badgePending > 0 ? `₹${badgePending.toFixed(2)}` : "₹0.00"}</strong>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })() : <p>No extra badges requested.</p>}
                                    </div>
                                  </div>
                                  <div className="new-payment-form-section">
                                    <h2 className="payment-details-form-heading">Payment Details</h2>
                                    <div className="new-payment-form-grid">
                                      <div className="new-payment-form-row">
                                        <div className="new-payment-input-group"><label className="new-payment-inputlabel">Payment Type:</label><input className="new-payment-inputbox" type="text" placeholder="CHQ/NEFT/IMPS" value={badgePaymentType} onChange={(e) => setBadgePaymentType(e.target.value)} /></div>
                                        <div className="new-payment-input-group"><label className="new-payment-inputlabel">Payment Date:</label><input className="new-payment-inputbox" type="date" value={badgePaymentDate} onChange={(e) => setBadgePaymentDate(e.target.value)} /></div>
                                      </div>
                                      <div className="new-payment-form-row">
                                        <div className="new-payment-input-group"><label className="new-payment-inputlabel">Name of Exhibitor Bank:</label><input className="new-payment-inputbox" type="text" placeholder="Exhibitor Bank Name" value={badgeExhibitorBankName} onChange={(e) => setBadgeExhibitorBankName(e.target.value)} /></div>
                                        <div className="new-payment-input-group"><label className="new-payment-inputlabel">Name of Receiver Bank:</label><input className="new-payment-inputbox" type="text" placeholder="Receiver Bank Name" value={badgeReceiverBankName} onChange={(e) => setBadgeReceiverBankName(e.target.value)} /></div>
                                      </div>
                                      <div className="new-payment-form-row">
                                        <div className="new-payment-input-group"><label className="new-payment-inputlabel">Amount:</label><input className="new-payment-inputbox" type="number" placeholder="Amount" value={badgeAmount} onChange={(e) => setBadgeAmount(e.target.value)} /></div>
                                        <div className="new-payment-input-group"><label className="new-payment-inputlabel">TDS:</label><input className="new-payment-inputbox" type="number" placeholder="TDS" value={badgeTds} onChange={(e) => setBadgeTds(e.target.value)} /></div>
                                      </div>
                                      <div className="new-payment-form-row button-row">
                                        <div className="new-payment-add-button-inline">
                                          {editingBadgeIndex === null
                                            ? <button className="new-payment-add-btn" onClick={handleAddBadgePayment}>Add Payment</button>
                                            : <button className="new-payment-update-btn" onClick={handleUpdateBadgePayment}>Update Payment</button>}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="payment-main-row">
                                  <div className="added-payments-section full-width">
                                    <h2 className="payment-details-form-heading">Added Payments</h2>
                                    {badgePayments.length === 0 ? <p style={{ padding: "8px 0" }}>No payment records added yet.</p> : (
                                      <div className="payment-table-container">
                                        <table className="payment-details-table">
                                          <thead><tr><th>Payment Type</th><th>Payment Date</th><th>Exhibitor Bank</th><th>Receiver Bank</th><th>Received Payment</th><th>TDS</th><th>Action</th></tr></thead>
                                          <tbody>
                                            {badgePayments.map((pay, index) => (
                                              <tr key={index}>
                                                <td>{pay.type || "-"}</td><td>{pay.date || "-"}</td><td>{pay.exhibitorBank || "-"}</td><td>{pay.receiverBank || "-"}</td>
                                                <td>₹{parseFloat(pay.amount || 0).toFixed(2)}</td><td>₹{parseFloat(pay.tds || 0).toFixed(2)}</td>
                                                <td>
                                                  <button onClick={() => handleEditBadgePayment(index)} className="payment-edit-btn-table">Edit</button>
                                                  <button onClick={() => handleDeleteBadgePayment(index)} className="payment-delete-btn-table">Delete</button>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Proforma Invoice */}
                            {invoiceOverlayVisible && (activePaymentDetailsOverlay === "stall" || activePaymentDetailsOverlay === "power") && (
                              <div className="invoice-overlay-slide">
                                <button className="invoice-close-btn" onClick={() => setInvoiceOverlayVisible(false)}>✕</button>
                                <div className="invoice-html-template" id="invoice-template">
                                  <h2 className="template-title">PROFORMA INVOICE</h2>
                                  <hr />
                                  <div className="invoice-header-row">
                                    <div className="from-column">
                                      <img src={TemplateLogo} alt="Company Logo" className="invoice-logo" />
                                      <div className="from-address">
                                        {activeAddress ? (
                                          <>
                                            <p>{activeAddress.data?.address}</p>
                                            <p>{activeAddress.data?.state} - {activeAddress.data?.pincode}</p>
                                            <p>Phone: {activeAddress.data?.phone}</p>
                                            <p>Email: {activeAddress.data?.email}</p>
                                            <p>GST: {activeAddress.data?.gst}</p>
                                          </>
                                        ) : <p style={{ color: "red" }}>No active address selected</p>}
                                      </div>
                                    </div>
                                    <div className="to-column">
                                      <div className="to-details">
                                        <p>M/S {formTemplateData.recipient}</p>
                                        <p>{formTemplateData.address1}</p>
                                        <p>{formTemplateData.stateCity?.split(",")[0]} - {formTemplateData.pincode}</p>
                                        <p>{formData.state}</p>
                                        <p>{formTemplateData.receiverEmail}</p>
                                        <label><strong>GST:</strong> {formData.gst}</label>
                                      </div>
                                    </div>
                                  </div>
                                  <hr />
                                  <div className="invoice-meta-row">
                                    <div className="invoice-meta-left"><p><strong>Proforma Invoice No:</strong> {activePaymentDetailsOverlay === "stall" ? stallProformaNumber : powerProformaNumber}</p></div>
                                    <div className="invoice-meta-right"><p><strong>Issue Date:</strong> {issueDate}</p></div>
                                  </div>
                                  <hr />
                                  {/* Invoice table - kept same as original */}
                                  <table className="invoice-table" style={{ tableLayout: "fixed", width: "100%" }}>
                                    <thead>
                                      <tr>
                                        <th style={{ width: "40%" }}>PARTICULARS</th>
                                        {activePaymentDetailsOverlay === "stall" && stallService?.selectedOptions?.map((opt, i) => <th key={i} style={{ width: "15%", textAlign: "center" }}>{opt}</th>)}
                                        {activePaymentDetailsOverlay === "power" && powerService?.selectedOptions?.map((opt, i) => <th key={i} style={{ width: "15%", textAlign: "center" }}>{opt}</th>)}
                                        {activePaymentDetailsOverlay === "stall" && <th style={{ width: "20%", textAlign: "center" }}>PRICE ({stallSummary?.currency || "Rupees"})</th>}
                                        <th style={{ width: "20%", textAlign: "center" }}>TOTAL ({stallSummary?.currency || "Rupees"})</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {activePaymentDetailsOverlay === "stall" && stallServiceRows.map((row, rowIndex) => (
                                        <tr key={rowIndex}>
                                          <td className="particular-cell" style={{ textAlign: "left" }}>
                                            {row.particular.split("\n").map((line, i) => line.startsWith("**") && line.endsWith("**") ? <strong key={i}>{line.replace(/\*\*/g, "")}</strong> : <div key={i}>{line}</div>)}
                                            {stallList[rowIndex]?.stall_category && <div>{stallList[rowIndex].stall_category.trim().split(" ").slice(0, -1).join(" ")}</div>}
                                          </td>
                                          {stallService?.selectedOptions?.map((opt, i) => {
                                            let values = [];
                                            if (opt.toLowerCase().includes("stall no")) values = stallList.map((st) => st.stall_number || "-");
                                            else if (opt.toLowerCase().includes("cat")) values = stallList.map((st) => { if (!st.stall_category) return "-"; const parts = st.stall_category.trim().split(" "); return parts.pop(); });
                                            else if (opt.toLowerCase().includes("stall size")) values = stallList.map((st) => st.stall_area || "-");
                                            return <td key={i} style={{ textAlign: "center" }}>{values.map((val, idx) => <div key={idx}>{val}</div>)}</td>;
                                          })}
                                          <td style={{ textAlign: "center" }}>{stallList.map((st, idx) => <div key={idx}>{st.stall_price || "-"}</div>)}</td>
                                          <td style={{ textAlign: "center" }}>{stallList.map((st, idx) => <div key={idx}>{(parseFloat(st.stall_price || 0) * parseFloat(st.stall_area || 0)).toFixed(2)}</div>)}</td>
                                        </tr>
                                      ))}
                                      {/* Summary rows, HSN etc - same as original */}
                                      <tr>
                                        <td colSpan={Math.floor(((stallService?.selectedOptions?.length || 0) + 4) / 2)} style={{ textAlign: "left", fontWeight: "bold" }}>HSN CODE: 998596</td>
                                        <td colSpan={Math.ceil(((stallService?.selectedOptions?.length || 0) + 4) / 2)} style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                          <em>{activePaymentDetailsOverlay === "stall" ? numberToWords(stallSummary?.grand_total || stallList?.[0]?.grand_total || 0) : activePaymentDetailsOverlay === "power" ? numberToWords(grandTotal) : ""}</em>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                  <hr />
                                  <div className="invoice-footer">
                                    <p><strong>ALL CHEQUES SHOULD BE SENT TO THE FOLLOWING ADDRESS</strong></p>
                                    <p><strong>THIS IS NOT AN INVOICE, THE FINAL TAX INVOICE WILL BE ISSUED LATER</strong></p>
                                  </div>
                                </div>
                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px", paddingRight: "30px" }}>
                                  <button onClick={handleDownloadPDF} className="download-pdf-button">Download PDF</button>
                                  <button onClick={handleSendPDFEmail} className="send-email-button">Send Email</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── FACIA BOARD ── */}
                  {activeNavbarItem === "FACIA BOARD" && (
                    <div className="facia-board-form slide-up-form">
                      <h2 className="facia-board-heading">Facia Board</h2>
                      <div className="facia-board-row">
                        <div className="facia-board-input-section">
                          <label htmlFor="faciaText">Enter Facia Text:</label>
                          <input type="text" id="faciaText" placeholder="Company Name or Text for Facia" value={faciaText} onChange={(e) => setFaciaText(e.target.value)} />
                        </div>
                        <div className="facia-board-button-section">
                          <button className="payment-details-add-payment-btn" onClick={showExhibitorEditForm ? handleUpdateFacia : handleSubmitFacia}>
                            {showExhibitorEditForm ? "Update" : "Submit"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── BRANDS ── */}
                  {activeNavbarItem === "BRANDS" && (
                    <div className="brands-container">
                      <div className="brands-form-admin slide-up-form">
                        <h2 className="brands-heading">Brands Preview</h2>
                        <div className="brands-input-row">
                          <div className="brands-field-group"><label>Website:</label><p>{brandsData.website || "-"}</p></div>
                          <div className="brands-field-group">
                            <label>Products:</label>
                            <div className="selected-products-container">
                              {(brandsData.products || []).length > 0
                                ? brandsData.products.map((product, index) => <div key={index} className="selected-product">{product}</div>)
                                : <p>-</p>}
                            </div>
                          </div>
                          <div className="brands-field-group"><label>Home Brands:</label><p>{brandsData.home_brands || "-"}</p></div>
                          <div className="brands-field-group"><label>Distributors of Brands:</label><p>{brandsData.distributors || "-"}</p></div>
                          <div className="brands-field-group"><label>International Brands:</label><p>{brandsData.international_brands || "-"}</p></div>
                        </div>
                      </div>

                      <div className="brands-form slide-up-form">
                        <h2 className="brands-heading">Brands</h2>
                        <div className="brands-input-row">
                          <div className="brands-field-group">
                            <label>Website:</label>
                            <input type="text" value={brandsData.website} onChange={(e) => setBrandsData((prev) => ({ ...prev, website: e.target.value }))} />
                          </div>
                          <div className="brands-field-group">
                            <label>Products:</label>
                            <div className="selected-products-container">
                              {Array.isArray(brandsData.products) && brandsData.products.map((product, index) => (
                                <div key={index} className="selected-product">
                                  {product}
                                  <span className="remove-icon" onClick={() => setBrandsData((prev) => ({ ...prev, products: prev.products.filter((p) => p !== product) }))}>✖</span>
                                </div>
                              ))}
                            </div>
                            <select value="" onChange={(e) => { const selected = e.target.value; if (selected && !brandsData.products.includes(selected)) setBrandsData((prev) => ({ ...prev, products: [...prev.products, selected] })); }}>
                              <option value="">-- Select Product --</option>
                              {products.map((product, index) => <option key={index} value={product.name}>{product.name}</option>)}
                            </select>
                          </div>
                          <div className="brands-field-group"><label>Home Brands:</label><input type="text" value={brandsData.home_brands} onChange={(e) => setBrandsData((prev) => ({ ...prev, home_brands: e.target.value }))} /></div>
                          <div className="brands-field-group"><label>Distributors of Brands:</label><input type="text" value={brandsData.distributors} onChange={(e) => setBrandsData((prev) => ({ ...prev, distributors: e.target.value }))} /></div>
                          <div className="brands-field-group"><label>International Brands:</label><input type="text" value={brandsData.international_brands} onChange={(e) => setBrandsData((prev) => ({ ...prev, international_brands: e.target.value }))} /></div>
                        </div>
                        <div className="brands-button-section">
                          <button className="brands-details-add-brands-btn" onClick={showBrandsEditForm ? handleUpdateBrands : handleSubmitBrands}>
                            {showBrandsEditForm ? "Update" : "Submit"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}