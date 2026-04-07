export const SOCIAL_ENABLED = {
  instagram: !!(process.env.FACEBOOK_APP_ID && process.env.INSTAGRAM_ACCOUNT_ID),
  facebook: !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_PAGE_ACCESS_TOKEN),
};

export function assertSocialEnabled(platform: "instagram" | "facebook") {
  if (!SOCIAL_ENABLED[platform]) {
    throw new Error(
      `${platform} credentials not configured. Add FACEBOOK_APP_ID and ${
        platform === "instagram" ? "INSTAGRAM_ACCOUNT_ID" : "FACEBOOK_PAGE_ACCESS_TOKEN"
      } to enable.`,
    );
  }
}
