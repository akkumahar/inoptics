import React from 'react';
import HomePage from './HomePage';
import FloatingCard from './FloatingCard';
import PageWrapper from './PageWrapper';

const HomePageWrapper = () => {
  return (
    <PageWrapper>
      <HomePage />
      {/* <FloatingCard /> */}
    </PageWrapper>
  );
};

export default HomePageWrapper;
