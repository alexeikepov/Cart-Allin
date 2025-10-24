import { db } from "./db_conn";

async function fixUniqueConstraint() {
  try {
    const hasOldConstraint = await db.raw(`
      SELECT conname
      FROM pg_constraint
      WHERE conname = 'categories_name_unique';
    `);

    if (hasOldConstraint.rows.length > 0) {
      console.log("🧹 Removing old UNIQUE constraint (name only)...");
      await db.raw(
        `ALTER TABLE categories DROP CONSTRAINT categories_name_unique;`
      );
      console.log("✅ Old constraint removed");
    } else {
      console.log("⚠️ Old constraint not found, skipping...");
    }

    console.log("🔒 Adding UNIQUE constraint for (user_id, name)...");
    await db.raw(`
      ALTER TABLE categories
      ADD CONSTRAINT categories_user_name_unique UNIQUE (user_id, name);
    `);

    console.log("✅ Done! Now each user can have same category names safely.");
  } catch (err) {
    console.error("❌ Error applying migration:", err);
  } finally {
    db.destroy();
  }
}

fixUniqueConstraint();
