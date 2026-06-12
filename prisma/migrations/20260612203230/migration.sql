/*
  Warnings:

  - Made the column `tokenVersion` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "tokenVersion" SET NOT NULL,
ALTER COLUMN "tokenVersion" SET DEFAULT 0;
