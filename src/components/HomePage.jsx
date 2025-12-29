import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import './HomePage.css';
import { FaUsers, FaWarehouse, FaTags, FaEye } from 'react-icons/fa';
import AmarbirImg from '../assets/Amarbir-1.png';
import Interview from '../assets/Interview-1.png';
import Narsiman from '../assets/NarsimanOG.png';
import Transition from '../assets/Transitions-OG2.png';
import '@fortawesome/fontawesome-free/css/all.min.css';
import PrivacyPolicy from './PrivacyPolicy';
import Terms from './Terms'; 
import AboutUs from './AboutUs';
import MetroMap from './MetroMap';
import ExhibitionMap from './ExhibitionMap';
import WeatherInfo from './WeatherInfo';
import TouristSpots from './TouristSpots';
import Footer from './Footer';



const HomePage = ({ onBackToLanding, handleHomePageInView, showBreadcrumbs   }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const contentRef = useRef(null);
  const [scrollState, setScrollState] = useState("idle");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [homeVideoURL, setHomeVideoURL] = useState("");
  const [testimonials, setTestimonials] = useState([]);
  const [ourStoryData, setOurStoryData] = useState([]);
  const [founderSectionData, setFounderSectionData] = useState([]);

   const [isAuto, setIsAuto] = useState(true); // control auto slider
  const intervalRef = useRef(null);

   // ==== Fetch Our Story ====
  useEffect(() => {
    const fetchOurStoryData = async () => {
      try {
        const res = await fetch("https://inoptics.in/api/get_our_story.php");
        const data = await res.json();
        setOurStoryData(data || []);
      } catch (err) {
        console.error("Failed to fetch Our Story data", err);
      }
    };

    fetchOurStoryData();
  }, []);

useEffect(() => {
  const fetchFounderSectionData = async () => {
    try {
      const res = await fetch("https://inoptics.in/api/get_founder_section.php");
      const data = await res.json();
      setFounderSectionData(data || []);
    } catch (err) {
      console.error("Failed to fetch Founder Section data", err);
    }
  };

  fetchFounderSectionData();
}, []);


  useEffect(() => {
    fetchPeopleComments();
  }, []);

  const fetchPeopleComments = async () => {
    try {
      const res = await fetch('https://inoptics.in/api/get_people_comments.php');
      const data = await res.json();
      setTestimonials(data);
    } catch (err) {
      console.error(err);
    }
  };

const stripHTML = (html) => {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

const navigate = useNavigate();


const [activeSection, setActiveSection] = useState("home");

const handleNavigation = (section) => {
  setActiveSection(section);
};


// useEffect(() => {
//   const fetchHomeVideo = async () => {
//     try {
//       const res = await fetch("https://inoptics.in/api/get_home_videos.php");
//       const data = await res.json();
//       if (data.length > 0) {
//         setHomeVideoURL(`https://inoptics.in/api/${data[0].video_path}`);
//       }
//     } catch (error) {
//       console.error("Failed to load home page video", error);
//     }
//   };

//   fetchHomeVideo();
// }, []);



  const itemsPage = 4;
  const filteredTestimonials = testimonials.filter(
    (t) => t.name.toUpperCase() !== "AKASH GOYLE"
  );

  // bigPerson card
  const bigPerson = testimonials.find(
    (t) => t.name.toUpperCase() === "AKASH GOYLE"
  );

  // small cards (current 4)
  const smallTestimonials = filteredTestimonials.slice(
    currentIndex,
    currentIndex + itemsPage
  );


const totalPagesTestimonials = Math.ceil(filteredTestimonials.length / itemsPage);
const currentPageTestimonials = Math.floor(currentIndex / itemsPage);


  // go to next 4
  const goToNext = () => {
    setCurrentIndex((prev) => {
      if (prev + itemsPage >= filteredTestimonials.length) {
        return 0; // restart
      }
      return prev + itemsPage;
    });
    setIsAuto(false); // stop auto slider after manual click
  };

  // go to previous 4
  const goToPrevious = () => {
    setCurrentIndex((prev) => {
      if (prev - itemsPage < 0) {
        const remainder = filteredTestimonials.length % itemsPage;
        return remainder === 0
          ? filteredTestimonials.length - itemsPage
          : filteredTestimonials.length - remainder;
      }
      return prev - itemsPage;
    });
    setIsAuto(false); // stop auto slider after manual click
  };

  // auto slider every 5s
  useEffect(() => {
    if (filteredTestimonials.length === 0 || !isAuto) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev + itemsPage >= filteredTestimonials.length) {
          return 0;
        }
        return prev + itemsPage;
      });
    }, 5000);

    return () => clearInterval(intervalRef.current);
  }, [filteredTestimonials.length, isAuto]);


  //   useEffect(() => {
  //     handleHomePageInView?.(inView);
  //   }, [inView, handleHomePageInView]);

  // useEffect(() => {
  //   if (inView && !hasAnimated) {
  //     setHasAnimated(true); 
  //   }
  // }, [inView, hasAnimated]);

  
  
  const itemsPerPage = 4; // Show 2 news per page (you can change it)

  const newsItems = [
    {
      img: Narsiman,
      alt: 'News Image 3',
      title: 'TRANSITIONS® Gen S™ set to redefine the eyewear industry',
      summary: 'In the ever-evolving world of eyewear, Transitions® GEN S™ is poised to revolutionise the industry with its cutting-edge technology and stylish design…',
      link: 'https://www.tionet.in/transitions-gen-s-set-to-redefine-the-eyewear-industry/',
    },
    {
      img: AmarbirImg,
      alt: 'News Image 1',
      title: 'An icon of luxury eyewear in India Amarbir Singh',
      summary: 'Kering Eyewear is part of the Kering Group, a global luxury group that develops products for renowned names in fashion, leather goods and jewellery, including luxury eyewear brands',
      link: 'https://www.tionet.in/amarbir-singh/',
    },
 
    {
      img: Interview,
      alt: 'News Image 2',
      title: 'MIDO, unparalleled global platform shaping the future of the global eyewear market',
      summary: 'As the newly appointed President of MIDO and ANFAO, Ms Lorraine Berton brings a wealth of experience and dedication to the optical industry. With a long-standing commitment',
      link: 'https://www.tionet.in/lorraine-berton/',
    },
 
    {
      img: Transition,
      alt: 'News Image 4',
      title: 'TRANSITIONS® Gen S™ the new Lens Standard',
      summary: 'Transitions® lenses, one of the most recognised consumer brands in optics worldwide, have introduced a ground-breaking…',
      link: 'https://www.tionet.in/transitions-gen-s-the-new-lens-standard/',
    },
  ];

  const totalPages = Math.ceil(newsItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const selectedNews = newsItems.slice(startIndex, startIndex + itemsPerPage);

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const paginationNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationNumbers.push(i);
  }


  
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setGridVisible(true);
  
  //     setTimeout(() => {
  //       setActiveImage(prev => (prev === 0 ? 1 : 0));
  //       setGridVisible(false);
  //     }, 2200); 
  //   }, 5000);
  
  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    const container = contentRef.current;

    const handleWheel = (e) => {
      const isScrollingUp = e.deltaY < 0;
      const atTop = container.scrollTop === 0;

      if (isScrollingUp) {
        if (atTop) {
          if (scrollState === "readyToExit") {
           navigate('/', { state: { showSponsors: true } }); // 👈 Tell LandingPage to show section 2
          } else {
            setScrollState("readyToExit");
            container.scrollTop = 1;
            e.preventDefault();
            e.stopPropagation();
          }
        } else {
          setScrollState("idle");
        }
      } else {
        setScrollState("idle");
      }
    };

    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel);
      }
    };
  }, [scrollState, navigate]); 

// inside HomePage component (near other useEffects/hooks)
const wrapperRef = useRef(null);
const iframeRef = useRef(null);
const VIDEO_ASPECT = 16 / 9; // YouTube typical aspect ratio; change if necessary

useEffect(() => {
  const wrapper = wrapperRef.current;
  const iframe = iframeRef.current;
  if (!wrapper || !iframe) return;

  // set CSS var for navbar height so CSS calc uses real height
  function updateNavbarHeightVar() {
    const navbar = document.querySelector('.navbar');
    const navHeight = navbar ? navbar.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--navbar-height', `${Math.ceil(navHeight)}px`);
  }

  // size iframe to "cover" wrapper (like background-size: cover)
  function fitIframeCover() {
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;

    // width required to keep aspect ratio if height = wrapper height
    const widthIfFullHeight = Math.ceil(h * VIDEO_ASPECT);
    // height required to keep aspect ratio if width = wrapper width
    const heightIfFullWidth = Math.ceil(w / VIDEO_ASPECT);

    if (widthIfFullHeight >= w) {
      // use full wrapper height, allow width to overflow (cropped horizontally)
      iframe.style.width = `${widthIfFullHeight}px`;
      iframe.style.height = `${h}px`;
    } else {
      // use full wrapper width, allow height to overflow (cropped vertically)
      iframe.style.width = `${w}px`;
      iframe.style.height = `${heightIfFullWidth}px`;
    }

    // center is handled by CSS transform; ensure min fill
    iframe.style.minWidth = '100%';
    iframe.style.minHeight = '100%';
  }

  // combined update
  function updateAll() {
    updateNavbarHeightVar();
    fitIframeCover();
  }

  // initial
  updateAll();

  // observe wrapper and viewport changes
  let ro;
  if (window.ResizeObserver) {
    ro = new ResizeObserver(() => updateAll());
    ro.observe(wrapper);
    ro.observe(document.documentElement); // in case CSS var or viewport changes
    const nav = document.querySelector('.navbar');
    if (nav) ro.observe(nav);
  } else {
    window.addEventListener('resize', updateAll);
  }

  // small delay call in case fonts or layout shift
  const t = setTimeout(updateAll, 150);

  return () => {
    clearTimeout(t);
    if (ro) ro.disconnect();
    else window.removeEventListener('resize', updateAll);
  };
}, []); 


  return (
    <div className="home-page">
    
      <div className="main-content-wrapper" ref={contentRef}>
      {showBreadcrumbs}

      {activeSection === "home" && (
          <>

<div ref={wrapperRef} className="home-intro-video-wrapper">
  <iframe
    ref={iframeRef}
    className="home-intro-video"
    src="https://www.youtube.com/embed/L9OHFU62kX8?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&playlist=L9OHFU62kX8"
    frameBorder="0"
    allow="autoplay; encrypted-media"
    allowFullScreen
    title="Intro Video"
  />
</div>


      <div className="main-content">
        
  <h1
        className="fade-typewriter"
        dangerouslySetInnerHTML={{
          __html: ourStoryData[0]?.title || "Our Story",
        }}
      />

      <hr />
       <p
        className="fade-typewriter"
        dangerouslySetInnerHTML={{
          __html:
            ourStoryData[0]?.description || "Loading our story description...",
        }}
      />

        
            <div className="counter-wrapper" ref={ref}>
          <div className="counter-box">
            <FaUsers className="counter-icon" />
            <h2>{inView && <CountUp end={349} duration={7} />}</h2>
            <p>Exhibitors</p>
          </div>
          <div className="counter-box">
            <FaWarehouse className="counter-icon" />
            <h2>{inView && <CountUp end={24000} duration={9} separator="," />}</h2>
            <p>Exhibition Area (sqm)</p>
          </div>
          <div className="counter-box">
            <FaTags className="counter-icon" />
            <h2>{inView && <CountUp end={1500} duration={7} separator="," />}+</h2>
            <p>Brands</p>
          </div>
          <div className="counter-box">
            <FaEye className="counter-icon" />
            <h2>{inView && <CountUp end={20000} duration={9} separator="," />}+</h2>
            <p>Visitors</p>
          </div>
        </div>

<div className="Founder-content">
  <div className='founder-heading'>
    <h2
      className="fade-typewriter"
      dangerouslySetInnerHTML={{
        __html: founderSectionData[0]?.heading || "The Heart Behind the Mission",
      }}
    />
  </div>
  <div className='founder-comb'>
    <div className="founder-image">
      {founderSectionData[0]?.image_url ? (
        <img src={founderSectionData[0].image_url} alt="Founder" />
      ) : (
        <img src={require('../assets/FounderGold.png')} alt="Founder Gold" />
      )}
    </div>
    <div className='description'>
      <p
        className="fade-typewriter"
        dangerouslySetInnerHTML={{
          __html: founderSectionData[0]?.description || "Founder description will appear here.",
        }}
      />
    </div>
  </div>
</div>



<div className="Headlines-content">
  <h2>Headlines that matter</h2>

  <ul className="latest-news-grid">
    {selectedNews.map((item, index) => (
      <li className="news-card" key={index}>
      <h4 className="news-title">{item.title}</h4>
    
      <div className="news-image-summary-wrapper">
        <div className="news-image">
          <img src={item.img} alt={item.alt} />
        </div>
        <p className="news-summary">{item.summary}</p>
      </div>
    
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="read-more-button"
      >
        TAKE ME THERE <span style={{ fontSize: '1.2em' }}>➤</span>
      </a>
    </li>
    ))}
  </ul>

  <div className="pagination-buttons">
    <button onClick={() => handlePageClick(currentPage - 1)} disabled={currentPage === 1}>
      &lt;
    </button>
    {paginationNumbers.map((num) => (
      <button
        key={num}
        onClick={() => handlePageClick(num)}
        className={currentPage === num ? 'active' : ''}
      >
        {num}
      </button>
    ))}
    <button onClick={() => handlePageClick(currentPage + 1)} disabled={currentPage === totalPages}>
      &gt;
    </button>
  </div>
</div>


<div className="double2">
<div className="value-of-visits-section">
<p className="highlights">The Value of</p>
<p className="highlights1">Your Visit</p>
</div>
<div className="cards8">
    <div className="visit-card"><p>➤&nbsp;&nbsp;Unique Networking Opportunities: Connect with top-tier professionals from across the optical industry.</p></div>
    <div className="visit-card"><p>➤&nbsp;&nbsp;Forge Valuable Partnerships: Build meaningful relationships with key industry players to shape the future of the optical market.</p></div>
    <div className="visit-card"><p>➤&nbsp;&nbsp;Collaborative Solutions: Work together on innovations and solutions that will define the next chapter of optics.</p></div>
    <div className="visit-card"><p>➤&nbsp;&nbsp;Cutting-Edge Discoveries: Explore the latest eyewear designs and breakthroughs in optical technology.</p></div>
    <div className="visit-card"><p>➤&nbsp;&nbsp;Celebrating Artistry & Science: Immerse yourself in the fusion of design, technology, and the science behind eyewear.</p></div>
    <div className="visit-card"><p>➤&nbsp;&nbsp;Business & Inspiration Combined: In-Optics provides an event that blends both business opportunities and creative inspiration.</p></div>
    <div className="visit-card"><p>➤&nbsp;&nbsp;Legacy of 40+ Years: With over four decades of leadership, In-Optics has been a pivotal force in shaping India's optical market.</p></div>
    <div className="visit-card"><p>➤&nbsp;&nbsp;Heart of the Optical Community: In-Optics is where visionaries from around the world unite to push boundaries and celebrate the transformative power of eyewear.</p></div>
</div>
</div>

   <div className="testimonial-container">
      <div className="testimonial-header">
        <h2 className="testimonial-title">
          <span className="title-top">What People</span>
          <br />
          <span className="title-middle">Are</span>
          <br />
          <span className="title-bottom">Saying</span>
        </h2>

        {bigPerson && (
          <div className="testimonial-big-card">
            <div className="testimonial-big-left">
              <img
                src={`https://inoptics.in/api/${bigPerson.image_path}`}
                alt={bigPerson.name}
              />
            </div>
            <div className="testimonial-big-right-container">
              <div className="testimonial-big-right">
                <p>{stripHTML(bigPerson.comment)}</p>
                <span className="name">{bigPerson.name}</span>
                <span className="designation">{bigPerson.designation}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="testimonial-carousel-wrapper">
        <div className="carousel-buttons">
          <button onClick={goToPrevious} className="prev-btn">
            ⮜
          </button>
          <button onClick={goToNext} className="next-btn">
            ⮞
          </button>
        </div>
        <div className="testimonial-cards">
          {smallTestimonials.map((t, i) => (
            <div key={i} className="testimonial-card">
              <div className="testimonial-content">
                <div className="top-image">
                  <img
                    src={`https://inoptics.in/api/${t.image_path}`}
                    alt={t.name}
                  />
                </div>
                <div className="mid-comment">
                  <p>{stripHTML(t.comment)}</p>
                </div>
                <div className="bottom-name">
                  <span>{t.name}</span>
                </div>
                <div className="bottom-designation">
                  <span>{t.designation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      <div className="testimonial-dots">
  {Array.from({ length: totalPagesTestimonials }).map((_, index) => (
    <span
      key={index}
      className={`dot ${index === currentPageTestimonials ? "active" : ""}`}
      onClick={() => {
        setCurrentIndex(index * itemsPage);
        setIsAuto(false);
      }}
    ></span>
  ))}
</div>
      </div>
    </div>

<div className="bullet-point-container">
<div className="bullet-left">
  <div className="bullet-line-one">  
    <div className="bullet-ground">
      <h2 className="bullet-heading">Your</h2>
    </div>
    <h2 className="bullet-heading2">One-Stop</h2>
  </div>
  <h2 className="bullet-heading3">Optical Products Hub:</h2>
</div>

    <div className="bullet-right">
  <ul className="infoGraphic">
    <li>
      <div className="numberWrap">
        <div className="number fontColor1 ">1</div>
        <div className="coverWrap">
          <div className="numberCover"></div>
        </div>
      </div>
      <div className="content">
        <h2>Artificial Eyes</h2>
      </div>
    </li>
    <li>
      <div className="numberWrap">
        <div className="number fontColor2">2</div>
        <div className="coverWrap">
          <div className="numberCover"></div>
        </div>
      </div>
      <div className="content">
        <h2>Contact & Cosmetic lenses</h2>
      </div>
    </li>
    <li>
      <div className="numberWrap">
        <div className="number fontColor3">3</div>
        <div className="coverWrap">
          <div className="numberCover"></div>
        </div>
      </div>
      <div className="content">
        <h2>Contact lens solutions & Accessories</h2>
      </div>
    </li>
    <li>
      <div className="numberWrap">
        <div className="number fontColor4">4</div>
        <div className="coverWrap">
          <div className="numberCover"></div>
        </div>
      </div>
      <div className="content">
        <h2>Eye Testing Equipments & Instruments</h2>
      </div>
    </li>
    <li>
      <div className="numberWrap">
        <div className="number fontColor5">5</div>
        <div className="coverWrap">
          <div className="numberCover"></div>
        </div>
      </div>
      <div className="content">
        <h2>Machines for Manufacturing Lenses</h2>
      </div>
    </li>
    <li>
      <div className="numberWrap">
        <div className="number fontColor6">6</div>
        <div className="coverWrap">
          <div className="numberCover"></div>
        </div>
      </div>
      <div className="content">
        <h2>Reading Spectacles</h2>
      </div>
    </li>
    <li>
      <div className="numberWrap">
        <div className="number fontColor7">7</div>
        <div className="coverWrap">
          <div className="numberCover"></div>
        </div>
      </div>
      <div className="content">
        <h2>Retail Management Software</h2>
      </div>
    </li>
    <li>
      <div className="numberWrap">
        <div className="number fontColor8">8</div>
        <div className="coverWrap">
          <div className="numberCover"></div>
        </div>
      </div>
      <div className="content">
        <h2>Raw Material for Manufacturing</h2>
      </div>
    </li>
    <li>
      <div className="numberWrap">
        <div className="number fontColor9">9</div>
        <div className="coverWrap">
          <div className="numberCover"></div>
        </div>
      </div>
      <div className="content">
        <h2>Showroom Setup & Display Products</h2>
      </div>
    </li>
    <li>
      <div className="numberWrap">
        <div className="number fontColor10">10</div>
        <div className="coverWrap">
          <div className="numberCover"></div>
        </div>
      </div>
      <div className="content">
        <h2>Spare Parts & Tools</h2>
      </div>
    </li>
    <li>
      <div className="numberWrap">
        <div className="number fontColor11">11</div>
        <div className="coverWrap">
          <div className="numberCover"></div>
        </div>
      </div>
      <div className="content">
        <h2>Sunglasses, Spectacle Frames & Cases</h2>
      </div>
    </li>
    <li>
      <div className="numberWrap">
        <div className="number fontColor12">12</div>
        <div className="coverWrap">
          <div className="numberCover"></div>
        </div>
      </div>
      <div className="content">
        <h2>Trade Journal</h2>
      </div>
    </li>
  </ul>
</div>
</div>
      </div>
       </>
      )}  

  {activeSection === "about" && (
          <div className="about-us-content">
            <button className="back-button" onClick={() => handleNavigation("home")}>← Back</button>
            <AboutUs />
          </div>
        )}

        {activeSection === "privacy-policy" && (
          <div className="policy-content">
            <PrivacyPolicy goBack={() => handleNavigation("home")} />
          </div>
        )}

        {activeSection === "terms" && (
          <div className="policy-content">
            <Terms goBack={() => handleNavigation("home")} />
          </div>
        )}

        {activeSection === "metro" && (
          <div className="policy-content">
            <button className="back-button" onClick={() => handleNavigation("home")}>← Back</button>
            <MetroMap />
          </div>
        )}

        {activeSection === "exhibition" && (
          <div className="policy-content">
            <button className="back-button" onClick={() => handleNavigation("home")}>← Back</button>
            <ExhibitionMap />
          </div>
        )}

        {activeSection === "weather" && (
          <div className="policy-content">
            <button className="back-button" onClick={() => handleNavigation("home")}>← Back</button>
            <WeatherInfo />
          </div>
        )}

        {activeSection === "tourist" && (
          <div className="policy-content">
            <button className="back-button" onClick={() => handleNavigation("home")}>← Back</button>
            <TouristSpots />
          </div>
        )} 
 
   <Footer />
</div>
</div>
  );
};

export default HomePage;
