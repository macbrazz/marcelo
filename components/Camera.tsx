import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CameraProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

const Camera: React.FC<CameraProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const openCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        activeStream = stream;
        setStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera: ", err);
        alert("Não foi possível acessar a câmera. Verifique as permissões.");
        onClose();
      }
    };

    openCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onClose]);

  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(dataUrl);
      }
    }
  }, [onCapture]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
      <canvas ref={canvasRef} className="hidden"></canvas>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50 flex justify-center items-center gap-8 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <button onClick={onClose} className="text-white text-sm font-semibold py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600">
          Cancelar
        </button>
        <button onClick={handleCapture} className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white" aria-label="Tirar foto">
        </button>
      </div>
    </div>
  );
};

export default Camera;