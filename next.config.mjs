/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
      process.env.CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_BUILD_SHA:
      process.env.NEXT_PUBLIC_BUILD_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA,
  },
};

export default nextConfig;
