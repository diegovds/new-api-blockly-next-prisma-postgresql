/*
  Warnings:

  - You are about to drop the column `thumbnail_name` on the `mazes` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnail_url` on the `mazes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "mazes" DROP COLUMN "thumbnail_name",
DROP COLUMN "thumbnail_url";
