import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const QrScanner = ({ onScan }) => {
  const [scannerActive, setScannerActive] = useState(true);
  const qrCodeRef = useRef(null);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("qr-code-scanner");

    const startScanner = () => {
      const config = { fps: 10, qrbox: 250, facingMode: { exact: "environment" } };
      html5QrCode.start({ facingMode: { exact: "environment" } }, config, (decodedText) => {
        console.log('Scanned QR Code:', decodedText);
        onScan(decodedText); // Pass the result to the parent
      }).catch(err => {
        console.error("Error starting QR code scanner:", err);
      });
    };

    if (scannerActive) {
      startScanner();
    }

    return () => {
      if (scannerActive) {
        html5QrCode.stop().catch(err => {
          console.error("Error stopping QR code scanner:", err);
        });
      }
    };
  }, [scannerActive, onScan]);

  return (
    <div id="qr-code-scanner" style={{ width: '100%' }}></div>
  );
};

export default QrScanner;
