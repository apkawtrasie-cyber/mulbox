import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
    // Dołącz pliki czcionek do serverless function generującej PDF załączniki.
    outputFileTracingIncludes: {
      "/api/f/[formId]": ["./src/lib/fonts/**"],
    },
  },
};

export default withNextIntl(nextConfig);
