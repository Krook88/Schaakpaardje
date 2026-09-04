/** @type {import('next').NextConfig} */
const nextConfig = {
  // Statische export: de app draait volledig in de browser en heeft geen server nodig.
  // Daardoor kan hij op elke hosting (ook simpele shared hosting) én op Vercel.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
}
export default nextConfig
