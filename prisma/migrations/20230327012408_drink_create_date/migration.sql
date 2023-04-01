-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "drinks" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR NOT NULL,
    "icon" VARCHAR NOT NULL,
    "coefficient" DOUBLE PRECISION DEFAULT 0,
    "caffeine" DOUBLE PRECISION DEFAULT 0,
    "sugar" DOUBLE PRECISION DEFAULT 0,
    "user_id" VARCHAR,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drinks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "parts" INTEGER NOT NULL,
    "drink_id" UUID NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entries" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "volume" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "drink_id" UUID NOT NULL,
    "user_id" VARCHAR NOT NULL,

    CONSTRAINT "entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_drink_ingredients" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE INDEX "drinks_id_user_id_idx" ON "drinks"("id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "drinks_id_user_id_key" ON "drinks"("id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "drinks_name_user_id_key" ON "drinks"("name", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "entries_timestamp_user_id_key" ON "entries"("timestamp", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "_drink_ingredients_AB_unique" ON "_drink_ingredients"("A", "B");

-- CreateIndex
CREATE INDEX "_drink_ingredients_B_index" ON "_drink_ingredients"("B");

-- AddForeignKey
ALTER TABLE "drinks" ADD CONSTRAINT "drinks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_drink_id_fkey" FOREIGN KEY ("drink_id") REFERENCES "drinks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_drink_ingredients" ADD CONSTRAINT "_drink_ingredients_A_fkey" FOREIGN KEY ("A") REFERENCES "drinks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_drink_ingredients" ADD CONSTRAINT "_drink_ingredients_B_fkey" FOREIGN KEY ("B") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
