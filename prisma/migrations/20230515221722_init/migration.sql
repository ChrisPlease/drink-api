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
    "serving_size" DOUBLE PRECISION NOT NULL,
    "user_id" VARCHAR,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted" TIMESTAMP(3),

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
CREATE TABLE "drink_ingredients" (
    "ingredient_id" UUID NOT NULL,
    "drink_id" UUID NOT NULL,

    CONSTRAINT "drink_ingredients_pkey" PRIMARY KEY ("drink_id","ingredient_id")
);

-- CreateTable
CREATE TABLE "entries" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
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
ALTER TABLE "drink_ingredients" ADD CONSTRAINT "drink_ingredients_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drink_ingredients" ADD CONSTRAINT "drink_ingredients_drink_id_fkey" FOREIGN KEY ("drink_id") REFERENCES "drinks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_drink_id_fkey" FOREIGN KEY ("drink_id") REFERENCES "drinks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
