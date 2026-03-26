/*
  Warnings:

  - You are about to drop the column `tshirtCount` on the `PPEOrder` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PPEOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "shoeSize" TEXT NOT NULL,
    "coverallSize" TEXT NOT NULL,
    "tshirtSize" TEXT NOT NULL,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PPEOrder_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PPEOrder" ("coverallSize", "createdAt", "emailSent", "employeeId", "id", "shoeSize", "tshirtSize") SELECT "coverallSize", "createdAt", "emailSent", "employeeId", "id", "shoeSize", "tshirtSize" FROM "PPEOrder";
DROP TABLE "PPEOrder";
ALTER TABLE "new_PPEOrder" RENAME TO "PPEOrder";
CREATE UNIQUE INDEX "PPEOrder_employeeId_key" ON "PPEOrder"("employeeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
