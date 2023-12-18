-- AlterExtension
ALTER EXTENSION "uuid-ossp" SET SCHEMA "extensions";

-- AlterTable
ALTER TABLE "drinks" ALTER COLUMN "id" SET DEFAULT extensions.uuid_generate_v4();

-- AlterTable
ALTER TABLE "entries" ALTER COLUMN "id" SET DEFAULT extensions.uuid_generate_v4();

-- AlterTable
ALTER TABLE "ingredients" ALTER COLUMN "id" SET DEFAULT extensions.uuid_generate_v4();
