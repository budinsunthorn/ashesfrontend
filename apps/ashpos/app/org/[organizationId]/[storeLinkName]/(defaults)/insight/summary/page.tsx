import { Metadata } from 'next';
import PageContent from './content';
export const metadata: Metadata = {
    title: 'Summary',
};
const Summary = () => {
    return <PageContent />;
};

export default Summary;
