// components/BarcodeScanner.tsx
import React, { useRef, useCallback, useState, Dispatch, SetStateAction } from 'react';
import Webcam from 'react-webcam';
// import { decode } from 'pdf417';

type StateSetter<T> = Dispatch<SetStateAction<T>>;
interface BarcodeScannerProps {
    setShowIDScan: StateSetter<boolean>;
}
const BarcodeScanner1 = ({setShowIDScan} : BarcodeScannerProps) => {
    const webcamRef = useRef<Webcam>(null);
    const [decodedInfo, setDecodedInfo] = useState<string | null>(null);

    const capture = useCallback(async () => {
        // console.log('Capturing image...', webcamRef.current);
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                const response = await fetch(imageSrc);
                const blob = await response.blob();
                const arrayBuffer = await blob.arrayBuffer();
                // const decodedData = decode(new Uint8Array(arrayBuffer));
                // console.log('Decoded data:', decodedData);
                // if (decodedData.length > 0) {
                //     setDecodedInfo(decodedData[0].data); // Get the first decoded data
                //     console.log('Decoded data:', decodedData[0].data);
                //     setShowIDScan(false);
                // } else {
                //     setDecodedInfo('No barcode found.');
                // }
            }
        } else {
            // console.log('There is no camera');
            setShowIDScan(false)
        }
    }, [webcamRef]);

    const handleUserMedia = (stream : any) => {  
        // console.log('Camera is ready', stream);  
      };  

    const handleUserMediaError = (error: any) => {
        // console.error('Camera error:', error);
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <Webcam className='webcam' audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width={400} onUserMedia={handleUserMedia} onUserMediaError={handleUserMediaError} videoConstraints={{  
          facingMode: 'user', width: 1280,  
          height: 720, // Use 'environment' for back camera on mobile devices  
        }}  />
            <button onClick={capture} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Capture and Decode
            </button>
            {decodedInfo && (
                <div className="mt-4 p-4 border border-gray-300 rounded">
                    <h2 className="text-lg font-semibold">Decoded Info:</h2>
                    <p>{decodedInfo}</p>
                </div>
            )}
        </div>
    );
};

export default BarcodeScanner1;
