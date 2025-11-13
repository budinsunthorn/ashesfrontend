import { Metadata } from "next";
import PageContent from "./content";

export const metadata: Metadata = {
    title: 'Action History',
};

export default function ActionHistory() {
    return <PageContent />;
}