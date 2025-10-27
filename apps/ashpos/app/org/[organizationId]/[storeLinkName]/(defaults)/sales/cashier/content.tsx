import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Link from 'next/link';
import React, { Fragment, useEffect, useState } from 'react';
import { IRootState } from '@/store';
import { useSelector } from 'react-redux';
import Cashier from '@/components/page-layouts/cashier';
import IconLoader from '@/components/icon/icon-loader';

const PageContent = () => {
    return <Cashier />;
};

export default PageContent;
