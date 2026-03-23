/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
      process.env.CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_BUILD_SHA:
      process.env.NEXT_PUBLIC_BUILD_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA,
    NEXT_PUBLIC_BUILD_ENV:
      process.env.NEXT_PUBLIC_BUILD_ENV ??
      process.env.VERCEL_ENV ??
      (process.env.NODE_ENV === "production" ? "production" : "local"),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
