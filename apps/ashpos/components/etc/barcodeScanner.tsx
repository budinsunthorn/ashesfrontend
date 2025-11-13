import { set } from 'lodash';
import React, { useState, useEffect, useRef } from 'react';

const BarcodeScanner = ({handleBarcodeScanner, refreshFlag} : {handleBarcodeScanner : (input: any) => void, refreshFlag : boolean}) => {
  const [barcode, setBarcode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      // First clear the value
      setBarcode('');
      
      // Then use a small timeout to focus after React has updated the DOM with the empty value
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          
          // Double-check that the value is still empty after focus
          if (inputRef.current.value !== '') {
            inputRef.current.value = '';
            setBarcode('');
          }
        }
      }, 50);
    }
  }, [refreshFlag, inputRef]);

  const handleInputChange = (event: any) => {
    setBarcode(event.target.value);
    handleBarcodeScanner(event.target.value)
  };

  return (
    <div>
      <input
        type="text"
        value={barcode}
        onChange={handleInputChange}
        ref={inputRef}
        className='form-input'
        autoComplete="off"
        name="barcode-scanner-input"
        id="barcode-scanner-input"
      />
    </div>
  );
};

export default BarcodeScanner;
