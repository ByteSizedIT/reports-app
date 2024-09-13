"use client";
const Spinner = ({ text }: { text?: string }) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <p className="m-2 md:text-lg">{text}</p>
      <div className="w-4 h-4 border-color-[3px] rounded-full border-4 border-slate-400 border-t-black animate-spin" />
    </div>
  );
};
export default Spinner;
