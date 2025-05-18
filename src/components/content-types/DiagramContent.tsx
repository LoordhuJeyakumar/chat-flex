'use client';
import mermaid from 'mermaid';
import { useEffect, useRef } from 'react';

export default function DiagramContent({ diagram }: { diagram: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false });
    if (ref.current) {
      const id = `diagram-${Date.now()}`;
      mermaid.mermaidAPI.render(id, diagram, (svgCode) => {
        if (ref.current) ref.current.innerHTML = svgCode;
      });
    }
  }, [diagram]);

  return <div ref={ref} className="my-2" />;
}
