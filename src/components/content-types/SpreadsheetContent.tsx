import { Table } from '@shadcn/ui'; // or use plain table
export function SpreadsheetContent({ data }: { data: any[][] }) {
  return (
    <div className="overflow-auto">
      <table className="table-auto border-collapse w-full">
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="border px-2 py-1">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}