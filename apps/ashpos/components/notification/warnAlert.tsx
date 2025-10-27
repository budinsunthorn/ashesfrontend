'use client';
import React from 'react';
import Swal from 'sweetalert2';

const warnAlert = async (text: String) => {
    const toast = Swal.mixin({
        toast: true,
        position: 'bottom-left',
        showConfirmButton: false,
        timer: 3000,
    });
    toast.fire({
        icon: 'warning',
        title: text,
        padding: '10px 20px',
    });
};

export default warnAlert;
