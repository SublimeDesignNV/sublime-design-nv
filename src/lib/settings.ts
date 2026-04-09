import { db } from "@/lib/db";
import { SITE } from "@/lib/constants";

export type BusinessSettings = {
  id: string;
  companyName: string;
  tagline: string | null;
  phone: string;
  email: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  website: string | null;
  instagramHandle: string | null;
  facebookUrl: string | null;
  pinterestUrl: string | null;
  youtubeUrl: string | null;
  googlePlaceId: string | null;
  gbpLocationId: string | null;
  hoursMonFri: string | null;
  hoursSat: string | null;
  hoursSun: string | null;
  serviceRadius: number | null;
  primaryTrade: string | null;
  secondaryTrade: string | null;
  brandPrimary: string;
  brandSecondary: string;
  heroHeadline: string | null;
  heroSubheadline: string | null;
  heroCtaLabel: string | null;
  cloudinaryFolder: string;
  cloudinaryQuality: string;
  cloudinaryMaxSizeMB: number;
  emailFromName: string;
  emailFromAddress: string;
  emailReplyTo: string;
  emailNotifyAddresses: string[];
  notifyNewLead: boolean;
  notifyStaleLead: boolean;
  notifyIntakeComplete: boolean;
  notifyKioskSubmit: boolean;
  notifyDailyDigest: boolean;
  notifyWeeklyDigest: boolean;
  notifySmsIntakeLink: boolean;
  notifySmsKiosk: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showHours: boolean;
  showLicenseNumbers: boolean;
  showServiceArea: boolean;
  showSocialLinks: boolean;
  updatedAt: Date;
  updatedBy: string | null;
};

export type ContractorLicense = {
  id: string;
  licenseType: string;
  licenseNumber: string;
  issuingState: string | null;
  expiresAt: Date | null;
  showOnSite: boolean;
  position: number;
};

const DEFAULT_SETTINGS: BusinessSettings = {
  id: "settings-singleton",
  companyName: SITE.name,
  tagline: SITE.tagline,
  phone: SITE.phone,
  email: SITE.email,
  address: SITE.address,
  city: "Las Vegas",
  state: "NV",
  zip: null,
  website: SITE.url,
  instagramHandle: null,
  facebookUrl: null,
  pinterestUrl: null,
  youtubeUrl: null,
  googlePlaceId: null,
  gbpLocationId: null,
  hoursMonFri: SITE.hours.weekdays,
  hoursSat: SITE.hours.weekend,
  hoursSun: null,
  serviceRadius: 50,
  primaryTrade: "Finish Carpentry",
  secondaryTrade: null,
  brandPrimary: "#CC2027",
  brandSecondary: "#1B2A6B",
  heroHeadline: null,
  heroSubheadline: null,
  heroCtaLabel: "Start with a Quote",
  cloudinaryFolder: "Sublime/Portfolio/",
  cloudinaryQuality: "auto",
  cloudinaryMaxSizeMB: 15,
  emailFromName: "Sublime Design NV",
  emailFromAddress: "info@sublimedesignnv.com",
  emailReplyTo: "info@sublimedesignnv.com",
  emailNotifyAddresses: ["info@sublimedesignnv.com"],
  notifyNewLead: true,
  notifyStaleLead: true,
  notifyIntakeComplete: true,
  notifyKioskSubmit: true,
  notifyDailyDigest: false,
  notifyWeeklyDigest: false,
  notifySmsIntakeLink: true,
  notifySmsKiosk: true,
  showAddress: true,
  showPhone: true,
  showEmail: true,
  showHours: true,
  showLicenseNumbers: true,
  showServiceArea: true,
  showSocialLinks: true,
  updatedAt: new Date(),
  updatedBy: null,
};

export async function getBusinessSettings(): Promise<BusinessSettings> {
  if (!process.env.DATABASE_URL) return DEFAULT_SETTINGS;
  try {
    const settings = await db.businessSettings.findFirst();
    return (settings as BusinessSettings) ?? DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getLicenses(): Promise<ContractorLicense[]> {
  if (!process.env.DATABASE_URL) return [
    { id: "lic-c3", licenseType: "C3 Carpentry", licenseNumber: "#82320", issuingState: "NV", expiresAt: null, showOnSite: true, position: 0 },
    { id: "lic-b2", licenseType: "B2 General Contractor", licenseNumber: "#92234", issuingState: "NV", expiresAt: null, showOnSite: true, position: 1 },
  ];
  try {
    return (await db.contractorLicense.findMany({ orderBy: { position: "asc" } })) as ContractorLicense[];
  } catch {
    return [];
  }
}
