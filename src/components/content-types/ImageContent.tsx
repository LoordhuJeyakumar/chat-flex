import Image from "next/image";

export function ImageContent({ url, alt }: { url: string; alt?: string }) {
  return <Image src={url} alt={alt || "Image"} className="max-w-full rounded" />;
}