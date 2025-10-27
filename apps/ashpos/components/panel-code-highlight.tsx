'use client';
import CodeHighlight from '@/components/highlight';
import IconHelpCircle from '@/components/icon/icon-help-circle';
import React, { useState, ReactNode } from 'react';
import { IRootState } from '@/store';
import { useSelector } from 'react-redux'


interface PanelCodeHighlightProps {
    children: ReactNode;
    title?: string;
    codeHighlight?: string;
    id?: string;
    className?: string;
}

const PanelCodeHighlight = ({ children, title, codeHighlight, id, className = '' }: PanelCodeHighlightProps) => {
    const [toggleCode, setToggleCode] = useState(false);
    const panelType = useSelector((state: IRootState) => state.themeConfig.panelType);

    return (
        <div className={`${panelType == 'plain' ? 'plain-panel' : 'panel'} text-dark dark:text-white-dark ${className} p-5`} id={id}>
            <div className="mb-5 flex items-center justify-between">
                <h5 className="text-lg font-semibold dark:text-white-dark">{title}</h5>
                <button type="button" className="font-semibold hover:text-gray-400 dark:text-gray-400 dark:hover:text-gray-600" onClick={() => setToggleCode(!toggleCode)}>
                    {/* <span className="flex items-center">
                        <IconHelpCircle className="me-2" />
                        Help
                    </span> */}
                </button>
            </div>
            {children}
            {toggleCode && (
                <CodeHighlight>
                    <pre className="language-xml w-5/6 max-w-full whitespace-pre-wrap">{codeHighlight}</pre>
                </CodeHighlight>
            )}
        </div>
    );
};

export default PanelCodeHighlight;
