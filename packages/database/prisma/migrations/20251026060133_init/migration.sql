-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "userId" TEXT DEFAULT 'default',
    "settings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Chat_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "branchId" TEXT,
    CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "ChatBranch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatBranch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentId" TEXT,
    "chatId" TEXT NOT NULL,
    "branchPoint" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatBranch_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChatBranch_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ChatBranch" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "personality" TEXT,
    "firstMessage" TEXT,
    "avatar" TEXT,
    "background" TEXT,
    "exampleMessages" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "settings" TEXT
);

-- CreateTable
CREATE TABLE "WorldInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "keywords" TEXT,
    "activationType" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "settings" TEXT
);

-- CreateTable
CREATE TABLE "WorldInfoCharacter" (
    "worldInfoId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,

    PRIMARY KEY ("worldInfoId", "characterId"),
    CONSTRAINT "WorldInfoCharacter_worldInfoId_fkey" FOREIGN KEY ("worldInfoId") REFERENCES "WorldInfo" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorldInfoCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorldInfoVector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldInfoId" TEXT NOT NULL,
    "embedding" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorldInfoVector_worldInfoId_fkey" FOREIGN KEY ("worldInfoId") REFERENCES "WorldInfo" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIModelConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "apiKey" TEXT,
    "baseUrl" TEXT,
    "settings" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Plugin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "author" TEXT,
    "homepage" TEXT,
    "repository" TEXT,
    "license" TEXT,
    "keywords" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "config" TEXT,
    "manifest" TEXT NOT NULL,
    "installedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PluginSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pluginId" TEXT NOT NULL,
    "scopeType" TEXT NOT NULL,
    "scopeId" TEXT,
    "config" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PluginSetting_pluginId_fkey" FOREIGN KEY ("pluginId") REFERENCES "Plugin" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PluginSetting_scopeId_fkey" FOREIGN KEY ("scopeId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSetting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "language" TEXT NOT NULL DEFAULT 'en',
    "uiSettings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SystemLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FileStorage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "originalName" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "hash" TEXT,
    "uploadedBy" TEXT DEFAULT 'default',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Chat_characterId_idx" ON "Chat"("characterId");

-- CreateIndex
CREATE INDEX "Chat_userId_idx" ON "Chat"("userId");

-- CreateIndex
CREATE INDEX "Chat_updatedAt_idx" ON "Chat"("updatedAt");

-- CreateIndex
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");

-- CreateIndex
CREATE INDEX "Message_chatId_timestamp_idx" ON "Message"("chatId", "timestamp");

-- CreateIndex
CREATE INDEX "Message_branchId_idx" ON "Message"("branchId");

-- CreateIndex
CREATE INDEX "ChatBranch_chatId_idx" ON "ChatBranch"("chatId");

-- CreateIndex
CREATE INDEX "ChatBranch_parentId_idx" ON "ChatBranch"("parentId");

-- CreateIndex
CREATE INDEX "ChatBranch_isActive_idx" ON "ChatBranch"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Character_name_key" ON "Character"("name");

-- CreateIndex
CREATE INDEX "Character_name_idx" ON "Character"("name");

-- CreateIndex
CREATE INDEX "Character_createdAt_idx" ON "Character"("createdAt");

-- CreateIndex
CREATE INDEX "WorldInfo_activationType_idx" ON "WorldInfo"("activationType");

-- CreateIndex
CREATE INDEX "WorldInfo_enabled_idx" ON "WorldInfo"("enabled");

-- CreateIndex
CREATE INDEX "WorldInfo_priority_idx" ON "WorldInfo"("priority");

-- CreateIndex
CREATE INDEX "WorldInfoVector_worldInfoId_idx" ON "WorldInfoVector"("worldInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "AIModelConfig_name_key" ON "AIModelConfig"("name");

-- CreateIndex
CREATE INDEX "AIModelConfig_provider_idx" ON "AIModelConfig"("provider");

-- CreateIndex
CREATE INDEX "AIModelConfig_isActive_idx" ON "AIModelConfig"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Plugin_name_key" ON "Plugin"("name");

-- CreateIndex
CREATE INDEX "Plugin_enabled_idx" ON "Plugin"("enabled");

-- CreateIndex
CREATE INDEX "Plugin_name_idx" ON "Plugin"("name");

-- CreateIndex
CREATE INDEX "PluginSetting_pluginId_idx" ON "PluginSetting"("pluginId");

-- CreateIndex
CREATE INDEX "PluginSetting_scopeType_scopeId_idx" ON "PluginSetting"("scopeType", "scopeId");

-- CreateIndex
CREATE INDEX "PluginSetting_enabled_idx" ON "PluginSetting"("enabled");

-- CreateIndex
CREATE INDEX "UserSetting_id_idx" ON "UserSetting"("id");

-- CreateIndex
CREATE INDEX "SystemLog_timestamp_idx" ON "SystemLog"("timestamp");

-- CreateIndex
CREATE INDEX "SystemLog_level_idx" ON "SystemLog"("level");

-- CreateIndex
CREATE UNIQUE INDEX "FileStorage_filename_key" ON "FileStorage"("filename");

-- CreateIndex
CREATE INDEX "FileStorage_filename_idx" ON "FileStorage"("filename");

-- CreateIndex
CREATE INDEX "FileStorage_mimeType_idx" ON "FileStorage"("mimeType");

-- CreateIndex
CREATE INDEX "FileStorage_uploadedBy_idx" ON "FileStorage"("uploadedBy");

-- CreateIndex
CREATE INDEX "FileStorage_hash_idx" ON "FileStorage"("hash");
