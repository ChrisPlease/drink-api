import { MigrationInterface, QueryRunner } from 'typeorm'

export class init11674697652180 implements MigrationInterface {
    name = 'init11674697652180'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('CREATE TABLE "ingredients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "parts" integer NOT NULL, "drink_id" character varying NOT NULL, CONSTRAINT "PK_9240185c8a5507251c9f15e0649" PRIMARY KEY ("id"))')
        await queryRunner.query('CREATE TABLE "users" ("id" character varying NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))')
        await queryRunner.query('CREATE TABLE "drinks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "icon" character varying NOT NULL, "coefficient" double precision DEFAULT \'0\', "caffeine" double precision DEFAULT \'0\', "sugar" double precision DEFAULT \'0\', "user_id" character varying, CONSTRAINT "PK_c729b137d69b681e87798293e3f" PRIMARY KEY ("id"))')
        await queryRunner.query('CREATE TABLE "entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "count" integer DEFAULT \'0\', "drink_id" uuid NOT NULL, "user_id" character varying NOT NULL, CONSTRAINT "UQ_62a9a14d874150617dfa33394c9" UNIQUE ("user_id", "drink_id"), CONSTRAINT "REL_d5131611d25aa299dc50551eb4" UNIQUE ("drink_id"), CONSTRAINT "PK_23d4e7e9b58d9939f113832915b" PRIMARY KEY ("id"))')
        await queryRunner.query('CREATE TABLE "logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "volume" integer NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "entry_id" uuid NOT NULL, CONSTRAINT "PK_fb1b805f2f7795de79fa69340ba" PRIMARY KEY ("id"))')
        await queryRunner.query('CREATE TABLE "drink_ingredients" ("drink_id" uuid NOT NULL, "ingredient_id" uuid NOT NULL, CONSTRAINT "PK_c048b9ac3d795348157465d6d00" PRIMARY KEY ("drink_id", "ingredient_id"))')
        await queryRunner.query('CREATE INDEX "IDX_66315e6f682aee05c365e41278" ON "drink_ingredients" ("drink_id") ')
        await queryRunner.query('CREATE INDEX "IDX_f84dce9c6655656142641c3e7b" ON "drink_ingredients" ("ingredient_id") ')
        await queryRunner.query('ALTER TABLE "drinks" ADD CONSTRAINT "FK_6879b539a0286b32fd4a6435eac" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION')
        await queryRunner.query('ALTER TABLE "entries" ADD CONSTRAINT "FK_73b250bca5e5a24e1343da56168" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION')
        await queryRunner.query('ALTER TABLE "entries" ADD CONSTRAINT "FK_d5131611d25aa299dc50551eb47" FOREIGN KEY ("drink_id") REFERENCES "drinks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION')
        await queryRunner.query('ALTER TABLE "logs" ADD CONSTRAINT "FK_04e5cc19d487c9ca50a778ed69c" FOREIGN KEY ("entry_id") REFERENCES "entries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION')
        await queryRunner.query('ALTER TABLE "drink_ingredients" ADD CONSTRAINT "FK_66315e6f682aee05c365e412784" FOREIGN KEY ("drink_id") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE')
        await queryRunner.query('ALTER TABLE "drink_ingredients" ADD CONSTRAINT "FK_f84dce9c6655656142641c3e7ba" FOREIGN KEY ("ingredient_id") REFERENCES "drinks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION')
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "drink_ingredients" DROP CONSTRAINT "FK_f84dce9c6655656142641c3e7ba"')
        await queryRunner.query('ALTER TABLE "drink_ingredients" DROP CONSTRAINT "FK_66315e6f682aee05c365e412784"')
        await queryRunner.query('ALTER TABLE "logs" DROP CONSTRAINT "FK_04e5cc19d487c9ca50a778ed69c"')
        await queryRunner.query('ALTER TABLE "entries" DROP CONSTRAINT "FK_d5131611d25aa299dc50551eb47"')
        await queryRunner.query('ALTER TABLE "entries" DROP CONSTRAINT "FK_73b250bca5e5a24e1343da56168"')
        await queryRunner.query('ALTER TABLE "drinks" DROP CONSTRAINT "FK_6879b539a0286b32fd4a6435eac"')
        await queryRunner.query('DROP INDEX "public"."IDX_f84dce9c6655656142641c3e7b"')
        await queryRunner.query('DROP INDEX "public"."IDX_66315e6f682aee05c365e41278"')
        await queryRunner.query('DROP TABLE "drink_ingredients"')
        await queryRunner.query('DROP TABLE "logs"')
        await queryRunner.query('DROP TABLE "entries"')
        await queryRunner.query('DROP TABLE "drinks"')
        await queryRunner.query('DROP TABLE "users"')
        await queryRunner.query('DROP TABLE "ingredients"')
    }

}
