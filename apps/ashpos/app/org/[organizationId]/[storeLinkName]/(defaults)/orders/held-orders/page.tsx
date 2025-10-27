import { Metadata } from 'next';
import PageContent from './content';
export const metadata: Metadata = {
    title: 'Held Orders',
};
const HeldOrders = () => {
    return <PageContent/>
};

export default HeldOrders;
