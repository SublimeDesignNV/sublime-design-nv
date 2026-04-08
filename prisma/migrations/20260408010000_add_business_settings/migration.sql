CREATE TABLE IF NOT EXISTS "BusinessSettings" (
  "id"              TEXT NOT NULL,
  "companyName"     TEXT NOT NULL DEFAULT 'Sublime Design NV',
  "tagline"         TEXT DEFAULT 'Custom Woodwork. Elevated.',
  "phone"           TEXT NOT NULL DEFAULT '702-847-9016',
  "email"           TEXT NOT NULL DEFAULT 'info@sublimedesignnv.com',
  "address"         TEXT,
  "city"            TEXT DEFAULT 'Las Vegas',
  "state"           TEXT DEFAULT 'NV',
  "zip"             TEXT,
  "licenseC3"       TEXT DEFAULT 'C3 #82320',
  "licenseB2"       TEXT DEFAULT 'B2 #92234',
  "website"         TEXT DEFAULT 'https://sublimedesignnv.com',
  "instagramHandle" TEXT,
  "facebookUrl"     TEXT,
  "pinterestUrl"    TEXT,
  "youtubeUrl"      TEXT,
  "googlePlaceId"   TEXT,
  "gbpLocationId"   TEXT,
  "hoursMonFri"     TEXT DEFAULT '7:00 AM – 6:00 PM',
  "hoursSat"        TEXT,
  "hoursSun"        TEXT,
  "serviceRadius"   INTEGER DEFAULT 50,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedBy"       TEXT,
  CONSTRAINT "BusinessSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "BusinessSettings" ("id", "updatedAt")
VALUES ('settings-singleton', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
