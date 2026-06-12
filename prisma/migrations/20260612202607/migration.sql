/*
  Warnings:

  - You are about to drop the column `signOut` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "signOut",
ADD COLUMN     "tokenVersion" INTEGER;
