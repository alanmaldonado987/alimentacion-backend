-- AlterTable
ALTER TABLE "meals" DROP COLUMN "protein",
DROP COLUMN "carbs",
DROP COLUMN "fats",
ADD COLUMN "porcion" TEXT;

