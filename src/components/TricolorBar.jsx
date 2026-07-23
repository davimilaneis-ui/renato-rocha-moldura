export default function TricolorBar() {
  return (
    <div className="flex h-[10px] w-full shrink-0">
      <div className="flex-1 bg-amarelo" />
      <div className="flex-1 bg-verde" />
      <div className="flex-1 bg-azul-claro" />
    </div>
  );
}
