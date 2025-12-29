import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import PageWrapper from './PageWrapper';

const LandingPageWrapper = () => {
  const [showSponsors, setShowSponsors] = useState(false);
  const [isTransitionDone, setIsTransitionDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = (e) => {
      if (e.deltaY > 0) {
        if (!showSponsors) {
          setShowSponsors(true);
          setTimeout(() => {
            setIsTransitionDone(true);
          }, 1000);
        } else if (isTransitionDone) {
          navigate('/home');
        }
      } else {
        setShowSponsors(false);
        setIsTransitionDone(false);
      }
    };

    window.addEventListener('wheel', handleScroll, { passive: true });
    return () => window.removeEventListener('wheel', handleScroll);
  }, [showSponsors, isTransitionDone]);

  return (
    <PageWrapper>
      <LandingPage showSponsors={showSponsors} />
    </PageWrapper>
  );
};

export default LandingPageWrapper;
