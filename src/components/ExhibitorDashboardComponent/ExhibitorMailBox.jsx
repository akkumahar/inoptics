import React, { useEffect, useState } from "react";
import "./ExhibitorMailBox.css"
import { FaLongArrowAltLeft } from "react-icons/fa";

const MOBILE_BREAKPOINT = 768;

const ExhibitorMailbox = ({
  mailsList = [],
  loadingMails = false,
  selectedMail = null,
  onSelectMail,
  onBackToList,
}) => {
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= MOBILE_BREAKPOINT,
  );

  /* ---------- detect screen ---------- */

  useEffect(() => {
    const onResize = () =>
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const showListMobile = isMobile && !selectedMail;

  return (
    <div className="ExhibitorMails-instruction-container">

      {/* ================= HEADER ================= */}

      <div className="ExhibitorMails-instruction-header-mail-box">

        {/* 📱 MOBILE HEADER */}
        {isMobile ? (
          !selectedMail ? (
            <h3 className="ExhibitorMails-instruction-heading-mail-box">
              Inbox
            </h3>
          ) : (
            <div className="mail-mobile-header">
              <button
                className="mail-back-btn"
                onClick={onBackToList}
              >
                <FaLongArrowAltLeft />
              </button>
              <span className="mail-header-title">
                Mail
              </span>
            </div>
          )
        ) : (
          /* 💻 DESKTOP HEADER */
          <h3 className="ExhibitorMails-instruction-heading-mail-box">
            INBOX
          </h3>
        )}

      </div>

      {/* ================= BODY ================= */}

      <div
        className={`ExhibitorMails-instruction-body ${
          isMobile ? "mobile" : "desktop"
        }`}
      >

        {/* ================= MAIL LIST ================= */}

        {(showListMobile || !isMobile) && (
          <div className="mail-list-panel">

            {loadingMails ? (
              <p className="mail-status-text">
                Loading mails...
              </p>
            ) : mailsList.length === 0 ? (
              <p className="mail-status-text">
                No mails found.
              </p>
            ) : (
              mailsList.map((mail) => (
                <div
                  key={mail.id}
                  className={`mail-list-item ${
                    selectedMail?.id === mail.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => onSelectMail(mail)}
                >
                  <div className="mail-list-header">

                    <h4
                      className={`mail-subject ${
                        mail.is_read == 0
                          ? "unread"
                          : ""
                      }`}
                    >
                      {mail.subject}
                    </h4>

                    {mail.is_read == 0 && (
                      <span className="mail-new-badge">
                        New
                      </span>
                    )}

                  </div>

                  <small className="mail-date">
                    {new Date(
                      mail.sent_at
                    ).toLocaleString()}
                  </small>

                  <p
                    className="mail-snippet"
                    dangerouslySetInnerHTML={{
                      __html:
                        mail.content.length > 90
                          ? mail.content.substring(
                              0,
                              90,
                            ) + "..."
                          : mail.content,
                    }}
                  />
                </div>
              ))
            )}

          </div>
        )}

        {/* ================= MAIL VIEW ================= */}

        {/* 💻 Desktop → always visible */}
        {/* 📱 Mobile → only when selected */}

        {(!isMobile || selectedMail) && (
          <div className="mail-view-panel">

            {selectedMail ? (
              <>
                <h2 className="mail-view-subject">
                  {selectedMail.subject}
                </h2>

                <small className="mail-view-date">
                  {new Date(
                    selectedMail.sent_at
                  ).toLocaleString()}
                </small>

                <div
                  className="mail-view-content"
                  dangerouslySetInnerHTML={{
                    __html:
                      selectedMail.content,
                  }}
                />
              </>
            ) : (
              !isMobile && (
                <p className="mail-view-placeholder">
                  Select a mail to view
                </p>
              )
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default ExhibitorMailbox;
