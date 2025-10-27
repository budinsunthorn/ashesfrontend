import { Metadata } from 'next';
import PageContent from './content';
export const metadata: Metadata = {
    title: 'Tiny Packages',
};
const Page = () => {
    return <PageContent />;
};

export default Page;
