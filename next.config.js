/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      { hostname: "cdn.discordapp.com" },
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "*.gstatic.com" },
      { hostname: "res.cloudinary.com" },
    ],
  },
};

export default config;
