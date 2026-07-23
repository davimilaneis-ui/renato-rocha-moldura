export default function CanvasCard({ children }) {
  return (
    <div className="aspect-square w-[86vw] max-w-[380px] rounded-[24px] bg-bege p-4 shadow-xl shadow-black/20 lg:h-[min(62vh,560px)] lg:w-auto lg:max-w-none lg:p-6">
      {children}
    </div>
  );
}
