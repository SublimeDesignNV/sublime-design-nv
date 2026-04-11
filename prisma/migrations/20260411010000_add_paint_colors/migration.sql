CREATE TABLE "PaintColor" (
    "id"    TEXT NOT NULL,
    "brand" TEXT NOT NULL DEFAULT 'Sherwin-Williams',
    "code"  TEXT NOT NULL,
    "name"  TEXT NOT NULL,
    "hex"   TEXT NOT NULL,
    "r"     INTEGER NOT NULL,
    "g"     INTEGER NOT NULL,
    "b"     INTEGER NOT NULL,
    CONSTRAINT "PaintColor_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaintColor_code_key" ON "PaintColor"("code");
CREATE INDEX "PaintColor_name_idx" ON "PaintColor"("name");
CREATE INDEX "PaintColor_code_idx" ON "PaintColor"("code");
