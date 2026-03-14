export type ExternalPublicReviewSource = {
  provider: string;
  label: string;
  profileUrl?: string;
  ctaLabel?: string;
};

export const REVIEW_SOURCE = {
  provider: "local-curated",
  platformLabel: "Client Reviews",
  enabled: true,
  futureProvider: "google-business-profile",
  publicProfileLabel: "Google Business Profile",
  publicProfileUrl: "",
  readMoreCtaLabel: "Read more reviews",
  heading: "Client Reviews",
  subheading:
    "Recent homeowner feedback tied to real finish carpentry work in Las Vegas, Henderson, and Summerlin.",
  futureIntegrationNote:
    "This review layer is sourced locally for now and is structured to accept a future Google Business Profile feed without changing page contracts.",
} as const;

export const BUSINESS_PROFILE = {
  businessName: "Sublime Design NV",
  reviewProviderLabel: REVIEW_SOURCE.publicProfileLabel,
  reviewProfileUrl: REVIEW_SOURCE.publicProfileUrl,
  reviewCtaLabel: REVIEW_SOURCE.readMoreCtaLabel,
} as const;

export function getExternalPublicReviewSource(): ExternalPublicReviewSource | null {
  if (!BUSINESS_PROFILE.reviewProfileUrl) {
    return null;
  }

  return {
    provider: REVIEW_SOURCE.futureProvider,
    label: BUSINESS_PROFILE.reviewProviderLabel,
    profileUrl: BUSINESS_PROFILE.reviewProfileUrl,
    ctaLabel: BUSINESS_PROFILE.reviewCtaLabel,
  };
}
