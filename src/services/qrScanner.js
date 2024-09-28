import { Html5Qrcode } from 'html5-qrcode';

export const startQrScanner = (setScanResult, setScannerActive) => {
  const html5QrCode = new Html5Qrcode("qr-code-scanner");

  const config = { fps: 10, qrbox: 250, facingMode: { exact: "environment" } };
  html5QrCode.start({ facingMode: { exact: "environment" } }, config, (decodedText) => {
    console.log('Scanned QR Code:', decodedText);
    setScanResult(decodedText);
    window.location.href = decodedText;
  })
  .catch(err => {
    console.error("Error starting QR code scanner:", err);
  });

  setScannerActive(true);

  return () => {
    html5QrCode.stop().catch(err => {
      console.error("Error stopping QR code scanner:", err);
    });
  };
};
