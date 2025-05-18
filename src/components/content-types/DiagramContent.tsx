'use client';
import mermaid from 'mermaid';
import { useEffect, useRef } from 'react';

export default function DiagramContent({ diagram }: { diagram: string }) {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    mermaid.initialize({ startOnLoad: false });
    if (ref.current) {
      const id = `diagram-${Date.now()}`;
      
      try {
        // Use the Promise-based render method
        mermaid.render(id, diagram)
          .then(({ svg }) => {
            if (ref.current) {
              ref.current.innerHTML = svg;
            }
          })
          .catch((error: Error) => {
            console.error("Error rendering diagram:", error);
            if (ref.current) {
              ref.current.innerHTML = `<div class="text-red-500">Error rendering diagram: ${error.message}</div>`;
            }
          });
      } catch (error) {
        console.error("Error rendering diagram:", error);
      }
    }
  }, [diagram]);

  return <div ref={ref} className="my-2" />;
}
