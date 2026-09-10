"use client";

const PrintButton = () => {
  const handlePrint = () => window.print();

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="mt-10 rounded-full border border-black px-6 py-2 text-xs font-semibold uppercase tracking-widest print:hidden"
    >
      Print or save as PDF
    </button>
  );
};

export default PrintButton;
