'use client';
import Select from 'react-select';
import React from 'react';

const OrganizationSearchableSelect = () => {
    const options = [
        { value: 'orange', label: 'Orange' },
        { value: 'white', label: 'White' },
        { value: 'purple', label: 'Purple' },
    ];
    return (
        <div className="mb-5">
            <Select defaultValue={options[0]} options={options} isSearchable={false} />
        </div>
    );
};

export default OrganizationSearchableSelect;
