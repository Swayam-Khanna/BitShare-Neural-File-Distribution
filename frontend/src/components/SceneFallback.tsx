const SceneFallback = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#030712]">
      {/* Static Neural Hubs - High efficiency radial gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-[radial-gradient(circle,rgba(99,102,241,0.06)_0%,transparent_70%)] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-[radial-gradient(circle,rgba(79,70,229,0.06)_0%,transparent_70%)] rounded-full" />
      
      {/* Secondary Pulse Nodes - Static for performance */}
      <div className="absolute top-[30%] right-[5%] w-[45vw] h-[45vw] bg-[radial-gradient(circle,rgba(147,51,234,0.03)_0%,transparent_70%)] rounded-full" />
      <div className="absolute bottom-[20%] left-[15%] w-[35vw] h-[35vw] bg-[radial-gradient(circle,rgba(129,140,248,0.03)_0%,transparent_70%)] rounded-full" />

      {/* Atmospheric Shroud */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#030712]/40" />

      {/* Simplified Technical Overlay */}
      <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj48ZmlsdGVyIGlkPSJuIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNuKSIvPjwvc3ZnPg==')]" />
    </div>
  );
};

export default SceneFallback;

