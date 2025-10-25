import { db } from "./db_conn";

async function test() {
  const data =
    // יצירת טבלה חדשה של משתמשים
    // await db.schema.createTable("users", (table) => {
    //   table.increments("id").primary();
    //   table.string("user").notNullable().unique();
    //   table.timestamp("createdAt").defaultTo(db.fn.now());
    // });

    // הוספה של עמודה user_id לטבלת todos וקישור לטבלת users
    // await db.schema.alterTable("todos", (table) => {
    //   // Добавляем user_id и связываем с таблицей users
    //   table
    //     .integer("user_id")
    //     .unsigned()
    //     .references("id") // связываем с колонкой id
    //     .inTable("users") // из таблицы users
    //     .onDelete("CASCADE"); // если юзер удалится — его todo тоже удалятся
    // });

    // await db.schema.alterTable("categories", (table) => {
    //   table
    //     .integer("user_id")
    //     .unsigned()
    //     .references("id") // связываем с колонкой id
    //     .inTable("users") // из таблицы users
    //     .onDelete("CASCADE"); // если юзер удалится — его categories тоже удалятся
    // });

    //   await db.schema.createTable("products", (table) => {
    //     table.increments("id");
    //     table.string("name").notNullable();
    //     table.decimal("price", 10, 2).notNullable();
    //     table
    //       .integer("categoryId")
    //       .references("id")
    //       .inTable("categories")
    //       .onDelete("SET NULL");
    //     table.timestamp("createdAt").defaultTo(db.fn.now());
    //   });
    // console.log("✅ Table 'products' created");

    // await db.schema.createTable("cart_items", (table) => {
    //   table.increments("id");
    //   table
    //     .integer("userId")
    //     .references("id")
    //     .inTable("users")
    //     .onDelete("CASCADE");
    //   table
    //     .integer("productId")
    //     .references("id")
    //     .inTable("products")
    //     .onDelete("CASCADE");
    //   table.integer("quantity").notNullable().defaultTo(1);
    //   table.string("status").defaultTo("in_cart");
    //   table.timestamp("createdAt").defaultTo(db.fn.now());
    // });
    // console.log("✅ Table 'cart_items' created");

    // await db.schema.createTable("carts", (table) => {
    //   table.increments("id").primary();
    //   table.integer("userId").notNullable();
    //   table.string("status").defaultTo("in_cart");
    //   table.timestamp("createdAt").defaultTo(db.fn.now());
    // });

    await db.schema.alterTable("cart_items", (table) => {
      table
        .integer("cartId")
        .unsigned()
        .references("id")
        .inTable("carts")
        .onDelete("CASCADE");
    });

  console.log("data", data);

  console.log("done");
  db.destroy();
}

// const data = await db.schema.createTable("todos", (table) => {
//   table.increments("id");

//   table.text("text");

//   table.boolean("completed").defaultTo(false);

//   table.timestamp("createdAt").defaultTo(db.fn.now());

//   table.timestamp("completedAt").defaultTo(db.fn.now());
// });

// await db("todos").insert({ text: "asdasd" });

// await db.schema.alterTable("todos", (table) => {
//   table.string("category").defaultTo("General");
// });
// console.log("Added 'category' column ✅");

// await db("todos")
//   .update({ completed: true, completedAt: new Date() })
//   .where({ id: 1 });

// await db.schema.createTable("categories", (table) => {
//   table.increments("id");
//   table.string("name").notNullable().unique();
//   table.timestamp("createdAt").defaultTo(db.fn.now());
// });

// console.log("Table 'categories' created ✅");

//  למחוק את העמודה הישנה 'category'

// const hasOldColumn = await db.schema.hasColumn("todos", "category");
// if (hasOldColumn) {
//   await db.schema.alterTable("todos", (table) => {
//     table.dropColumn("category");
//   });
//   console.log("Dropped old 'category' column ✅");
// }

// const hasColumn = await db.schema.hasColumn("todos", "categoryId");
// if (!hasColumn) {
//   await db.schema.alterTable("todos", (table) => {
//     table
//       .integer("categoryId")
//       .unsigned()
//       .references("id")
//       .inTable("categories");
//   });
//   console.log("Added 'categoryId' column ✅");
// }

// const todos = await db("todos");
// console.log("todos", todos);}

test();
