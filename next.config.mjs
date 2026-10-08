/** @type {import('next').NextConfig} */
const nextConfig = {
  // Statische export: de app draait volledig in de browser en heeft geen server nodig.
  // Daardoor kan hij op elke hosting (ook simpele shared hosting) én op Vercel.
  output: 'export',
  // Zodat de app ook in een submap kan staan (schaakmaatje.nl/oefen/ bijvoorbeeld),
  // naast de gewone site. Leeg laten voor de domeinwortel. De audiolaag en de service
  // worker lezen dezelfde variabele.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
}
export default nextConfig
