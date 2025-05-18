'use client';
export default function ThinkingSteps({ steps }: { steps: string[] }) {
  return (
    <div className="p-2 bg-yellow-50 border-l-4 border-yellow-400">
      <ul className="list-disc list-inside">
        {steps.map((s, i) => <li key={i} className="text-sm text-yellow-800">{s}</li>)}
      </ul>
    </div>
  );
}