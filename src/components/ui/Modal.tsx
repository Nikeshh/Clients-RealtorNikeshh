interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[calc(100vh-2rem)]">
        {title && (
          <div className="px-6 py-4 border-b flex-shrink-0">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        )}
        <div className="px-6 py-4 overflow-y-auto flex-grow">{children}</div>
      </div>
    </div>
  );
} 