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

    CONSTRAINT "PK_c729b137d69b681e87798293e3f" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "parts" INTEGER NOT NULL,
    "drink_id" UUID NOT NULL,

    CONSTRAINT "PK_9240185c8a5507251c9f15e0649" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entries" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "volume" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "drink_id" UUID NOT NULL,
    "user_id" VARCHAR NOT NULL,

    CONSTRAINT "PK_23d4e7e9b58d9939f113832915b" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR NOT NULL,

    CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_drink_ingredients" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UQ_ae9bee7d1c147b2012de6d6312a" ON "drinks"("name", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "_drink_ingredients_AB_unique" ON "_drink_ingredients"("A", "B");

-- CreateIndex
CREATE INDEX "_drink_ingredients_B_index" ON "_drink_ingredients"("B");

-- AddForeignKey
ALTER TABLE "drinks" ADD CONSTRAINT "FK_6879b539a0286b32fd4a6435eac" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "FK_73b250bca5e5a24e1343da56168" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "FK_d5131611d25aa299dc50551eb47" FOREIGN KEY ("drink_id") REFERENCES "drinks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_drink_ingredients" ADD CONSTRAINT "_drink_ingredients_A_fkey" FOREIGN KEY ("A") REFERENCES "drinks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_drink_ingredients" ADD CONSTRAINT "_drink_ingredients_B_fkey" FOREIGN KEY ("B") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

