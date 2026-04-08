export const SOCIAL_ENABLED = {
  instagram: !!(process.env.FACEBOOK_APP_ID && process.env.INSTAGRAM_ACCOUNT_ID),
  facebook: !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_PAGE_ACCESS_TOKEN),
  pinterest: !!(process.env.PINTEREST_APP_ID && process.env.PINTEREST_APP_SECRET),
};

export function assertSocialEnabled(platform: "instagram" | "facebook" | "pinterest") {
  if (!SOCIAL_ENABLED[platform]) {
    const hints: Record<typeof platform, string> = {
      instagram: "FACEBOOK_APP_ID and INSTAGRAM_ACCOUNT_ID",
      facebook: "FACEBOOK_APP_ID and FACEBOOK_PAGE_ACCESS_TOKEN",
      pinterest: "PINTEREST_APP_ID and PINTEREST_APP_SECRET",
    };
    throw new Error(`${platform} credentials not configured. Add ${hints[platform]} to enable.`);
  }
}
