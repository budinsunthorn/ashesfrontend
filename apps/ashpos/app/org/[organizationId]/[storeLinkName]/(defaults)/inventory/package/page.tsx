import { Metadata } from 'next';
import PageContent from './content';
import { Suspense } from 'react';
export const metadata: Metadata = {
    title: 'Package',
};
const Products = () => {
    return (
          <PageContent />
    )
};

export default Products;
