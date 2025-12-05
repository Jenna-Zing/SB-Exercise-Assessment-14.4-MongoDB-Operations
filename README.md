# SB-Exercise-Assessment-14.4-MongoDB-Operations

Springboard SE Bootcamp - Assessment - 14.4 - MongoDB Operations

Assessment Instructions: https://lessons.springboard.com/MongoDB-Operations-Project-1d0f422b60488026beb8e90ec5dd7e2b

**Recommended: To see how this works, log into https://cloud.mongodb.com/, and go to your Database Clusters.**

1. Click `test-cluster` > "Data Explorer" > hover by "sample_mflix" row then click on trash can to delete it
2. Go back to "Database > Clusters" > click the "..." > "click "Load Sample Dataset" > select "sample_mflix" and then click "Load sample data"
3. This way, you get a fresh slate each time of seeing what this is supposed to run for all insert, updates, and deletes.

## SPECIAL NOTE: I added `.filter(10)` to my READ #3 and #4 due to the amount of records returned back, which doesn't let you see the results of my other code. Please feel free to delete/comment out the filter if you choose to individually test each! I tested each individually and commented out the rest.

## To Run the code, open a terminal and run `node program.js`

Helpful Docs: -- I used version 7 since that's closest to what's used in the package.json.

- MongoDB CRUD operations (https://www.mongodb.com/docs/v7.0/crud/)
- Aggregation Stages (https://www.mongodb.com/docs/v7.0/reference/mql/aggregation-stages/)
- Query Predicates (https://www.mongodb.com/docs/manual/reference/mql/query-predicates/) -> operations like $gt, etc. -> similar to WHERE CLAUSE in SQL

Things I learned while doing this:

- In MongoDB, methods like `.find()` and `.aggregate()` **do not return documents directly**.
  Instead, they return a **cursor** — an object that _points_ to the results.
  - A cursor is like a handle or pointer to a set of matching documents. It does **not** contain the documents itself.
  - This design allows MongoDB to:
    - stream documents in **batches**
    - avoid loading massive result sets into memory
    - let you iterate results efficiently
  - In other words:
    > A cursor is not “give me the documents.” It is “I am ready to give you documents when you ask for them.”
- This means when you query data like with `const cursor = movies.find({ director: "Christopher Nolan" });`, MongoDB **does NOT fetch any data yet**. Instead, it returns a cursor object. The Fetching happens **later**, when you iterate or convert the cursor. This is why logging a cursor shows a huge internal object, because its printing the _cursor_, not the documents.
- **Please review the MongoDB operators/methods and the logical comparison operators online**. One example: `find()` is like `SELECT [projection] FROM [collection] WHERE [filter]`.

## How to get the data from a cursor

1. Convert to an Array (most common)

   Fetches _all_ documents at once.

   ```js
   const docs = await movies.find({ director: "Christopher Nolan" }).toArray();

   console.log(docs);
   ```

2. Async Iterator (for await ... of)

   Fetch documents **one at a time**, streamed from MongoDB. Best for large result sets.

   ```js
   const cursor = movies.find({ director: "Christopher Nolan" });

   for await (const doc of cursor) {
     console.log(doc);
   }
   ```

3. Using cursor.forEach()

   A callback-style approach.

   ```js
   movies
     .find({ director: "Christopher Nolan" })
     .forEach((doc) => console.log(doc));
   ```

4. Using `cursor.next()`

   Manually pull one document at a time.

   ```js
   const cursor = movies.find({ director: "Christopher Nolan" });

   const first = await cursor.next();
   const second = await cursor.next();
   ```

## Summary

- `.find()` returns a **cursor, not** the documents.
- A cursor is an **async stream** of results.
- You must explicitly **iterate** or **convert** it to get the data.
- Use:
  - `toArray()` for small -> medium results
  - `for await (...)` for large datasets
  - `.forEach()` or `.next()` for specific use cases
- Only operations that can return **more than one document** return a cursor -> `.find()` and `.aggregate()`.
- Operations that do NOT return a cursor, these return **result objects** or **documents**, not cursors... `insertOne()`/`insertMany()`, `updateOne()`/`updateMany()`, `deleteOne()`/`deleteMany()`, or `findOne()`, etc. Check the documentation but usually they return objects with a `deletedCount` or `insertedId`/`upsertedId` for example.

## Aggregate

Aggregation is a way to process your data in multiple steps and get meaningful results like counting how many movies are in each genre, or doing multiple things like grouping, sorting, and filtering data all in on query.

It's like a pipeline in a factory:
`raw data → step 1 → step 2 → step 3 → final result`

For example, MongoDB uses `collection.aggregate()`, which takes an **array of stages**. Each stage **transforms the data** and passes it to the next stage.

```js
db.movies.aggregate([{ stage1 }, { stage2 }, { stage3 }]);
```

> Think of aggregation as processing your documents step by step!

## Common stages in aggregate:

| Stage      | Purpose                                           |
| ---------- | ------------------------------------------------- |
| `$match`   | Filters documents (like `find`)                   |
| `$group`   | Groups documents by a field (like SQL `GROUP BY`) |
| `$sort`    | Sorts documents                                   |
| `$project` | Shapes documents (like `SELECT field1, field2`)   |
| `$limit`   | Limits the number of results                      |
