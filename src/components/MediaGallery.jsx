import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";
import "./MediaGallery.css";

const MediaGallery = () => {
  const [mediaGalleryDetails, setMediaGalleryDetails] = useState([]);
  const [galleries, setGalleries] = useState({});
  const [activeGallery, setActiveGallery] = useState(null);
  const [modalIndex, setModalIndex] = useState(null);

  // Fetch media gallery data
  useEffect(() => {
    const fetchMediaGalleryDetails = async () => {
      try {
        const res = await fetch("https://inoptics.in/api/get_mediagallery_details.php");
        const data = await res.json();

        if (Array.isArray(data)) {
          setMediaGalleryDetails(data);

          // Group by heading
          const grouped = data.reduce((acc, item) => {
            if (!acc[item.heading]) acc[item.heading] = [];
            acc[item.heading].push(`https://inoptics.in/api/uploads/${item.image}`);
            return acc;
          }, {});
          setGalleries(grouped);
        }
      } catch (err) {
        console.error("Failed to fetch Media Gallery Details", err);
      }
    };

    fetchMediaGalleryDetails();
  }, []);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (modalIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalIndex]);

  // Keyboard navigation for modal
  useEffect(() => {
    const onKey = (e) => {
      if (modalIndex === null) return;
      if (e.key === "ArrowRight") nextImage();
      else if (e.key === "ArrowLeft") prevImage();
      else if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalIndex, activeGallery, galleries]);

  const openGallery = (galleryKey) => {
    setActiveGallery(galleryKey);
    setModalIndex(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openModal = (index) => setModalIndex(index);
  const closeModal = () => setModalIndex(null);
  const backToCards = () => {
    setActiveGallery(null);
    setModalIndex(null);
  };

  const nextImage = () => {
    if (!activeGallery || modalIndex === null) return;
    const imgs = galleries[activeGallery];
    setModalIndex((prev) => (prev + 1) % imgs.length);
  };

  const prevImage = () => {
    if (!activeGallery || modalIndex === null) return;
    const imgs = galleries[activeGallery];
    setModalIndex((prev) => (prev - 1 + imgs.length) % imgs.length);
  };

  // Convert object to array for rendering cards
  const cards = Object.entries(galleries);

  return (
    <div className="main-content-wrapper">
      <div className="main-Media-gallery-container">
        <Breadcrumbs />
        <h1 className="media-heading">Media Gallery</h1>

        {/* Card Grid */}
        {!activeGallery && (
          <div className="cards-row">
            {cards.map(([title, imgs]) => (
              <div
                key={title}
                className="gallery-card"
                onClick={() => openGallery(title)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && openGallery(title)}
              >
                <div className="card-image-wrap">
                  <img src={imgs[0]} alt={`${title} preview`} />
                </div>
                <div className="card-title">{title}</div>
              </div>
            ))}
          </div>
        )}

        {/* Active Gallery View */}
        {activeGallery && (
          <>
            <div className="active-header">
              <div className="active-title">{activeGallery}</div>
              <button className="active-back" onClick={backToCards}>
                ← Back
              </button>
            </div>

            <div className="gallery-grid">
              {galleries[activeGallery].map((img, idx) => (
                <div
                  className="gallery-thumb"
                  key={idx}
                  onClick={() => openModal(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && openModal(idx)}
                >
                  <img src={img} alt={`${activeGallery} ${idx}`} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal */}
        {modalIndex !== null && activeGallery && (
          <div className="modal-overlay" onClick={closeModal}>
            <div
              className="modal-box"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
              <button className="modal-prev" onClick={prevImage}>
                ‹
              </button>
              <div className="modal-img-wrap">
                <img
                  src={galleries[activeGallery][modalIndex]}
                  alt={`modal ${modalIndex}`}
                  draggable={false}
                />
              </div>
              <button className="modal-next" onClick={nextImage}>
                ›
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MediaGallery;
