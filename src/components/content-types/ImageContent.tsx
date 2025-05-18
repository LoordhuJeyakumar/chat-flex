export function ImageContent({ url, alt }: { url: string; alt?: string }) {
  return <img src={url} alt={alt} className="max-w-full rounded" />;
}