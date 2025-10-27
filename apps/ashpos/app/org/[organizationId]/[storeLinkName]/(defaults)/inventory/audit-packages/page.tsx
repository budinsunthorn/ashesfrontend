import { Metadata } from 'next';
import PageContent from './content';
import { Suspense } from 'react';
export const metadata: Metadata = {
    title: 'Audit Packages',
};
const Products = () => {
    return (
          <PageContent />
    )
};

export default Products;
