// Stub para Vitest.
//
// Next.js resuelve `import "server-only"` con un alias interno
// (next/dist/compiled/server-only), pero Vitest no conoce ese alias y falla al
// resolver el módulo. Este archivo vacío ocupa su lugar durante los tests: la
// barrera solo tiene sentido en el build de Next, no corriendo en Node.
export {};
