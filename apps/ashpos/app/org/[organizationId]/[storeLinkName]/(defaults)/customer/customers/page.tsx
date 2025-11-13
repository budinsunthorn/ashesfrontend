import { Metadata } from 'next';
import PageContent from './content';

export const metadata: Metadata = {
    title: 'Customers',
};

const CustomersList = () => {
    return <PageContent />;
};

export default CustomersList;
