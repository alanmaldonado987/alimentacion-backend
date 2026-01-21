-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DOCTOR', 'PATIENT');

-- CreateEnum
CREATE TYPE "MealType" AS ENUM ('BREAKFAST', 'MORNING_SNACK', 'LUNCH', 'AFTERNOON_SNACK', 'DINNER', 'EVENING_SNACK');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meal_plans" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,

    CONSTRAINT "meal_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_meals" (
    "id" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "dayName" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,

    CONSTRAINT "daily_meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meals" (
    "id" TEXT NOT NULL,
    "type" "MealType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "calories" INTEGER,
    "protein" DOUBLE PRECISION,
    "carbs" DOUBLE PRECISION,
    "fats" DOUBLE PRECISION,
    "time" TEXT,
    "dailyMealId" TEXT NOT NULL,

    CONSTRAINT "meals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "calories" INTEGER,
    "notes" TEXT,
    "mealId" TEXT NOT NULL,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "category" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DoctorPatients" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "_DoctorPatients_AB_unique" ON "_DoctorPatients"("A", "B");

-- CreateIndex
CREATE INDEX "_DoctorPatients_B_index" ON "_DoctorPatients"("B");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_meals" ADD CONSTRAINT "daily_meals_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_dailyMealId_fkey" FOREIGN KEY ("dailyMealId") REFERENCES "daily_meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foods" ADD CONSTRAINT "foods_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recommendations" ADD CONSTRAINT "recommendations_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DoctorPatients" ADD CONSTRAINT "_DoctorPatients_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DoctorPatients" ADD CONSTRAINT "_DoctorPatients_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
