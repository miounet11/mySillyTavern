-- Add category and sortOrder fields to Character table
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "category" TEXT;
ALTER TABLE "Character" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER DEFAULT 0;

-- Create CharacterCategory table
CREATE TABLE IF NOT EXISTS "CharacterCategory" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on category field
CREATE INDEX IF NOT EXISTS "Character_category_idx" ON "Character"("category");
CREATE INDEX IF NOT EXISTS "Character_sortOrder_idx" ON "Character"("sortOrder");

-- Insert default categories
INSERT INTO "CharacterCategory" ("id", "name", "description", "icon", "sortOrder") VALUES
('cat_cute', '可爱', '温柔可爱的角色', '🐱', 1),
('cat_cool', '冷酷', '冷静理智的角色', '❄️', 2),
('cat_wise', '智慧', '博学多才的角色', '🧠', 3),
('cat_history', '历史', '历史人物角色', '📜', 4),
('cat_fantasy', '奇幻', '奇幻世界角色', '🔮', 5),
('cat_scifi', '科幻', '科幻未来角色', '🚀', 6),
('cat_daily', '日常', '日常生活角色', '🏠', 7),
('cat_assistant', '助手', 'AI助手类角色', '🤖', 8)
ON CONFLICT (name) DO NOTHING;

