-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "userId" TEXT DEFAULT 'default',
    "settings" TEXT,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Chat_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Chat" ("characterId", "createdAt", "id", "settings", "title", "updatedAt", "userId") SELECT "characterId", "createdAt", "id", "settings", "title", "updatedAt", "userId" FROM "Chat";
DROP TABLE "Chat";
ALTER TABLE "new_Chat" RENAME TO "Chat";
CREATE INDEX "Chat_characterId_idx" ON "Chat"("characterId");
CREATE INDEX "Chat_userId_idx" ON "Chat"("userId");
CREATE INDEX "Chat_updatedAt_idx" ON "Chat"("updatedAt");
CREATE INDEX "Chat_isFavorite_idx" ON "Chat"("isFavorite");
CREATE INDEX "Chat_isArchived_idx" ON "Chat"("isArchived");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
