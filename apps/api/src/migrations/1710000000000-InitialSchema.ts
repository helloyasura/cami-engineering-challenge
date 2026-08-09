import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS customer_requests (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        message text NOT NULL,
        status varchar(32) NOT NULL DEFAULT 'open',
        category varchar(32) NULL,
        confidence double precision NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS request_notes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        body text NOT NULL,
        author_name varchar(120) NOT NULL,
        request_id uuid NOT NULL REFERENCES customer_requests(id) ON DELETE CASCADE,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_request_notes_request_id
      ON request_notes(request_id);
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS classification_history (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        message text NOT NULL,
        category varchar(32) NOT NULL,
        confidence double precision NOT NULL,
        request_id uuid NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_classification_history_created_at
      ON classification_history(created_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS classification_history;`);
    await queryRunner.query(`DROP TABLE IF EXISTS request_notes;`);
    await queryRunner.query(`DROP TABLE IF EXISTS customer_requests;`);
  }
}
