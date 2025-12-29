import React, { useEffect, useRef } from "react";
import "./TouristSpots.css";
import Footer from "./Footer";
import redfort from "../assets/RedFort.png";
import indiagate from "../assets/IndiaGate.jpg";
import rastrapati from "../assets/RashtrapatiBhaban.jpg";
import qutubminar from "../assets/QutubMinar.jpg";
import jantarmantar from "../assets/JantarMantar.jpg";
import akshardham from "../assets/Akshardham.jpg";
import chattarpur from "../assets/ChattarpurTemple.jpg";
import safdarjung from "../assets/TheTombOfSafdarjung.jpg";
import banglaSahib from "../assets/GurudwaraBanglaSahib.jpg";
import lotusTemple from "../assets/LotusTemple.png";
import gardenOfSenses from "../assets/GardenOfFiveSenses.png";
import dilliHaat from "../assets/DilliHaat.jpg";
import Breadcrumbs from './Breadcrumbs';

const TouristSpots = () => {
  const sliderContainerRef = useRef(null);
  const eraserRef = useRef(null);
  const prevBtnRef = useRef(null);
  const nextBtnRef = useRef(null);
  const pausedRef = useRef(false);
  const sliderIntervalRef = useRef(null);
  const currentIndexRef = useRef(0); // <-- Track current index globally

  const slidesData = [
    {
      image: redfort,
      title: "Red Fort",
      description:
        "The Red Fort is an epitome of the Mughal era in India and is the face of tourist attractions in Delhi...",
    },
    {
      image: indiagate,
      title: "India Gate",
      description:
        "India Gate is one monument that defines Delhi or India for that matter. It was built in 1931...",
    },
    {
      image: rastrapati,
      title: "Rashtrapati Bhawan",
      description:
        "On the opposite of the Rajpath is residence of the President of India. With four floors and 340 rooms...",
    },
    {
      image: qutubminar,
      title: "Qutub Minar",
      description:
        "Among the other places to visit in Delhi, Qutub Minar stands tall with its 73 meter tall brick minaret...",
    },
    {
      image: jantarmantar,
      title: "Jantar Mantar",
      description:
        "Constructed in 1724 by Maharaja Jai Singh of Jaipur, Jantar Mantar is an astronomical observatory...",
    },
    {
      image: akshardham,
      title: "Akshardham",
      description:
        "While sightseeing in Delhi, a visit is necessarily suggested to Swaminarayan Akshardham – one of the largest Hindu temples in the world...",
    },
    {
      image: chattarpur,
      title: "Chattarpur Temple",
      description:
        "Set amid the beautiful surroundings of South Delhi, Chattarpur is a popular temple founded in the 1970s by Sant Shree Nagpal Baba...",
    },
    {
      image: safdarjung,
      title: "The Tomb of Safdarjung",
      description:
        "The tomb is a very famous attraction in Delhi and is made up of marble and sandstone...",
    },
    {
      image: banglaSahib,
      title: "Gurudwara Bangla Sahib",
      description:
        "The iconic shrine of Sikhs, Gurudwara Bangla Sahib is visited by hundreds every day...",
    },
    {
      image: lotusTemple,
      title: "Lotus Temple",
      description:
        "Famously known as the Lotus temple, this Bahai House of Worship symbolizes unity among religions...",
    },
    {
      image: gardenOfSenses,
      title: "Garden of Five Senses",
      description:
        "This 20-acre lush green park offers a relaxing retreat from Delhi's pollution...",
    },
    {
      image: dilliHaat,
      title: "Dilli Haat",
      description:
        "An open-air food plaza and craft bazaar near INA, Dilli Haat is managed by the Delhi Tourism Authority...",
    },
  ];

  const showSlide = (index) => {
    const slides = sliderContainerRef.current?.querySelectorAll(".slide");
    if (!slides) return;
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === index);
    });
    currentIndexRef.current = index;
  };

  const activateEraser = (callback) => {
    eraserRef.current?.classList.add("active");
    setTimeout(() => {
      callback();
      setTimeout(() => eraserRef.current?.classList.remove("active"), 180);
    }, 500);
  };

  const nextSlide = () => {
    if (pausedRef.current) return;
    activateEraser(() => {
      const slides = sliderContainerRef.current.querySelectorAll(".slide");
      const newIndex = (currentIndexRef.current + 1) % slides.length;
      showSlide(newIndex);
    });
  };

  const prevSlide = () => {
    activateEraser(() => {
      const slides = sliderContainerRef.current.querySelectorAll(".slide");
      const newIndex =
        (currentIndexRef.current - 1 + slides.length) % slides.length;
      showSlide(newIndex);
    });
  };

  const resetInterval = () => {
    clearInterval(sliderIntervalRef.current);
    if (!pausedRef.current) {
      sliderIntervalRef.current = setInterval(nextSlide, 6000);
    }
  };

  useEffect(() => {
    const sliderContainer = sliderContainerRef.current;
    const slides = sliderContainer.querySelectorAll(".slide");

    slides.forEach((slide) => {
      slide.addEventListener("click", () => {
        pausedRef.current = !pausedRef.current;
        if (pausedRef.current) {
          clearInterval(sliderIntervalRef.current);
        } else {
          resetInterval();
        }
      });
    });

    prevBtnRef.current.addEventListener("click", () => {
      prevSlide();
      resetInterval();
    });

    nextBtnRef.current.addEventListener("click", () => {
      nextSlide();
      resetInterval();
    });

    showSlide(currentIndexRef.current);
    sliderIntervalRef.current = setInterval(nextSlide, 6000);

    return () => {
      clearInterval(sliderIntervalRef.current);
    };
  }, []);

  
  return (
    <div className="main-tourist-content-wrapper">
      <div className="tourist-container">
        <Breadcrumbs />
        <div className="intro-text-left-right-wrapper">
          <div className="intro-text">
            <h2 className="line-one">Let's</h2>
            <h2 className="line-two">Explore<br/><span>Delhi</span></h2>
            <h2 className="line-three">With Your Family & Friends</h2>
            
          </div>

          <div className="intro-text-right">
            <h2 className="places-heading">Click below to explore top tourist spots.
</h2>
            <div className="places-grid">
              {slidesData.map((spot, index) => (
                <div
                  key={index}
                  className="place-title"
                  onClick={() => {
                    showSlide(index);
                    clearInterval(sliderIntervalRef.current);
                  }}
                >
                  {spot.title}
                </div>
              ))}
            </div>
          </div>
        </div>
</div>

<div className="tourist-slider-wrapper">
        <div className="tourist-slider">
          <div className="tourist-slider-container" ref={sliderContainerRef}>
            {slidesData.map((spot, idx) => (
              <div
                key={idx}
                className={`slide ${idx === 0 ? "active" : ""}`}
                style={{
                  backgroundImage: `url(${spot.image})`,
                }}
              >
                <div className="info">
                  <h1>{spot.title}</h1>
                  <p>{spot.description}</p>
                </div>
              </div>
            ))}
          </div>
</div> 
          <div className="eraser" ref={eraserRef}></div>

          <div className="tourist-buttons-container">
            <button id="previous" ref={prevBtnRef}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <button id="next" ref={nextBtnRef}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
       
      
      <Footer />
    </div>
  );
};

export default TouristSpots;
