/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // `pg` is only used for local Postgres; keep it out of the bundle.
    serverComponentsExternalPackages: ["pg"],
  },
};

export default nextConfig;
