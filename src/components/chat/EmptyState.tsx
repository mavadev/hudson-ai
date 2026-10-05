import Image from "next/image";
import assets from "@/assets";

export const EmptyState = () => {
  return (
    <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 text-center px-4">
      <Image
        alt="Hudson AI"
        src={assets.hudson_logo}
        className="h-12 w-12 object-contain"
        priority
      />
      <div>
        <h1 className="max-w-md text-balance text-2xl font-semibold tracking-tight text-text-main">
          Bienvenido, soy Hudson
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          ¿En qué puedo ayudarte hoy?
        </p>
      </div>
    </section>
  );
};
