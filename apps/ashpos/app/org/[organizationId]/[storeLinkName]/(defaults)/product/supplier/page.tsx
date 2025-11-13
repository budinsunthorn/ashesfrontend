import { Metadata } from 'next';
import PageContent from './content';
import { Suspense } from 'react';
export const metadata: Metadata = {
    title: 'Register Suppliers',
};
const Suppliers = () => {
    return (
      <PageContent />
    )
};

export default Suppliers;
