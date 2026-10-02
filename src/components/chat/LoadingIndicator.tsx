import Image from "next/image";
import assets from "@/assets";

export function LoadingIndicator() {
  return (
    <div
      className="group py-0 text-sm flex gap-4 w-full"
      aria-label="Hudson está generando una respuesta"
    >
      <Image
        alt="Hudson AI Logo"
        src={assets.hudson_logo}
        className="h-10 w-10 shrink-0 border border-amber-900 rounded-full bg-amber-800 p-2"
      />
      <div className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300 [animation-delay:0.2s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-300 [animation-delay:0.4s]" />
      </div>
    </div>
  );
}
