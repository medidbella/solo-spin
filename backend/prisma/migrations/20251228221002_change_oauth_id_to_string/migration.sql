-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reg_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password_hash" TEXT,
    "avatar_path" TEXT NOT NULL,
    "refresh_token" TEXT,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "oauth_provider" TEXT,
    "oauth_id" TEXT
);
INSERT INTO "new_User" ("avatar_path", "email", "id", "name", "oauth_id", "oauth_provider", "password_hash", "refresh_token", "reg_date", "two_factor_enabled", "two_factor_secret", "username") SELECT "avatar_path", "email", "id", "name", "oauth_id", "oauth_provider", "password_hash", "refresh_token", "reg_date", "two_factor_enabled", "two_factor_secret", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
