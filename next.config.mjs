/**  @type {import('next').NextConfig} */

const nextConfig = {
  webpack: (config) => {
    /**
     * Critical: prevents " ⨯ ./node_modules/canvas/build/Release/canvas.node
     * Module parse failed: Unexpected character  (1:0)" error
     * ref: https://github.com/wojtekmaj/react-pdf/blob/main/sample/next-app/next.config.js
     * see specifically sample next app for react-pdf lib: https://github.com/wojtekmaj/react-pdf/blob/main/sample/next-app/next.config.js
     */
    config.resolve.alias.canvas = false;

    return config;
  },
};

export default nextConfig;
