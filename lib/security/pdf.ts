export function isPdfBuffer(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer.slice(0, 5));
  const header = String.fromCharCode(...bytes);
  return header.startsWith("%PDF-");
}
