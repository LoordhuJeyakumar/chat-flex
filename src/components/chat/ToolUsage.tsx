'use client';
export default function ToolUsage({ usage }: { usage: { tool: string; args: Record<string, unknown> }[] }) {
  return (
    <div className="p-2 bg-blue-50 border-l-4 border-blue-400">
      {usage.map((u, i) => (
        <div key={i} className="text-sm text-blue-800">
          <strong>{u.tool}:</strong> {JSON.stringify(u.args)}
        </div>
      ))}
    </div>
  );
}