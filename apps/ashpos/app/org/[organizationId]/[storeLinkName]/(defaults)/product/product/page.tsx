import { Metadata } from 'next';
import PageContent from './content';
import { Suspense } from 'react';
export const metadata: Metadata = {
    title: 'Products',
};
const Products = () => {
    return (
          <PageContent />
    )
};

export default Products;
