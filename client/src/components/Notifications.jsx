import { useEffect } from 'react';

function Notification({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success'
    ? 'bg-green-100 border-green-400 text-green-700'
    : 'bg-red-100 border-red-400 text-red-700';

  return (
    <div className={`fixed top-20 right-4 ${bgColor} border px-6 py-3 rounded-lg shadow-lg z-50`}>
      <div className="flex items-center justify-between gap-4">
        <span>{message}</span>
        <button onClick={onClose} className="font-bold hover:opacity-70">
          ✕
        </button>
      </div>
    </div>
  );
}

export default Notification;