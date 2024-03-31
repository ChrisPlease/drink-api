-- CreateSchema
CREATE SCHEMA IF NOT EXISTS extensions;

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- CreateTable
CREATE TABLE "drinks" (
    "id" UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "name" VARCHAR NOT NULL,
    "icon" VARCHAR NOT NULL,
    "user_id" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" TIMESTAMP(3),
    "upc" VARCHAR(12),

    CONSTRAINT "drinks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition" (
    "coefficient" DOUBLE PRECISION DEFAULT 100,
    "calories" DOUBLE PRECISION DEFAULT 0,
    "saturated_fat" DOUBLE PRECISION DEFAULT 0,
    "total_fat" DOUBLE PRECISION DEFAULT 0,
    "cholesterol" DOUBLE PRECISION DEFAULT 0,
    "sodium" DOUBLE PRECISION DEFAULT 0,
    "carbohydrates" DOUBLE PRECISION DEFAULT 0,
    "fiber" DOUBLE PRECISION DEFAULT 0,
    "sugar" DOUBLE PRECISION DEFAULT 0,
    "protein" DOUBLE PRECISION DEFAULT 0,
    "potassium" DOUBLE PRECISION DEFAULT 0,
    "caffeine" DOUBLE PRECISION DEFAULT 0,
    "drink_id" UUID NOT NULL,
    "added_sugar" DOUBLE PRECISION DEFAULT 0,
    "serving_size" DOUBLE PRECISION NOT NULL,
    "metric_size" INTEGER NOT NULL,
    "serving_unit" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "parts" DOUBLE PRECISION,
    "drink_id" UUID NOT NULL,
    "volume" DOUBLE PRECISION,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drink_ingredients" (
    "ingredient_id" UUID NOT NULL,
    "drink_id" UUID NOT NULL,

    CONSTRAINT "drink_ingredients_pkey" PRIMARY KEY ("drink_id","ingredient_id")
);

-- CreateTable
CREATE TABLE "entries" (
    "id" UUID NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "volume" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "drink_id" UUID NOT NULL,
    "user_id" VARCHAR NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "drinks_created_at_key" ON "drinks"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "drinks_upc_key" ON "drinks"("upc");

-- CreateIndex
CREATE INDEX "drinks_name_idx" ON "drinks"("name");

-- CreateIndex
CREATE INDEX "drinks_created_at_idx" ON "drinks"("created_at");

-- CreateIndex
CREATE INDEX "drinks_id_user_id_idx" ON "drinks"("id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "drinks_id_name_key" ON "drinks"("id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "drinks_id_user_id_key" ON "drinks"("id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "drinks_name_user_id_key" ON "drinks"("name", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_drink_id_key" ON "nutrition"("drink_id");

-- CreateIndex
CREATE UNIQUE INDEX "entries_timestamp_key" ON "entries"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "entries_volume_id_key" ON "entries"("volume", "id");

-- CreateIndex
CREATE UNIQUE INDEX "entries_drink_id_id_key" ON "entries"("drink_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "entries_id_user_id_key" ON "entries"("id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "entries_timestamp_user_id_key" ON "entries"("timestamp", "user_id");

-- AddForeignKey
ALTER TABLE "drinks" ADD CONSTRAINT "drinks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "nutrition" ADD CONSTRAINT "nutrition_drink_id_fkey" FOREIGN KEY ("drink_id") REFERENCES "drinks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drink_ingredients" ADD CONSTRAINT "drink_ingredients_drink_id_fkey" FOREIGN KEY ("drink_id") REFERENCES "drinks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drink_ingredients" ADD CONSTRAINT "drink_ingredients_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_drink_id_fkey" FOREIGN KEY ("drink_id") REFERENCES "drinks"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
