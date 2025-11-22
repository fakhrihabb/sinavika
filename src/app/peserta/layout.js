export default function PesertaLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-300 flex items-start justify-center">
      {/* Mobile Container - Max width 428px (iPhone 14 Pro Max) */}
      <div className="w-full max-w-[428px] min-h-screen bg-gray-50 shadow-2xl relative overflow-hidden">
        {/* Mobile Content */}
        <div className="w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
