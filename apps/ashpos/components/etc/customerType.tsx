'use client';
import React from 'react';

const CustomerType = (isMedical: any) => {
    return isMedical.isMedical === undefined || isMedical.isMedical === '' ? (
        <></>
    ) : isMedical.isMedical === true ? (
        <span className="badge badge-outline-success m-1">Medical</span>
    ) : (
        <span className="badge badge-outline-warning m-1">Recreational</span>
    );
};

export default CustomerType;
