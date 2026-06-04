import React from "react";

export default function BrandHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center px-8 pt-6 pb-4">
      <img
        src={import.meta.env.BASE_URL + "alstom.png"}
        alt="Alstom"
        className="h-16 w-auto select-none object-contain"
        draggable={false}
      />
    </header>
  );
}
