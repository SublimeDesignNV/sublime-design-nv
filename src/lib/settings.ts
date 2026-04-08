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
  licenseC3: string | null;
  licenseB2: string | null;
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
  updatedAt: Date;
  updatedBy: string | null;
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
  licenseC3: "C3 #82320",
  licenseB2: "B2 #92234",
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
