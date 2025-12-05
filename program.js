const { ObjectId } = require("mongodb");
const connect = require("./db");

const runDatabaseQueries = async () => {
  const db = await connect();
  const movies = db.collection("movies");
  const users = db.collection("users");
  const comments = db.collection("comments");

  /*  EXAMPLE - starter code
  // Run this query, should get top 5 best rated movies on IMDB
  const topMovies = await movies.find({ "imdb.rating": { $gt: 8.0 } })
    .project({ title: 1, year: 1, "imdb.rating": 1 })
    .sort({ "imdb.rating": -1 })
    .limit(5)
    .toArray();

  console.log('Top Rated Movies:', topMovies); 
  */

  // =========================================================================================================================

  // CREATE
  console.log("\nCREATE");
  /* 
    1. Insert a New Document into the Users Collection: Practice adding a new user document to the users collection. Include fields name and email.
    NOTE TO SELF:  Warning, do NOT use the same object for inserts -> if you do, MongoDB will reuse the same `_id` causing a duplicate id error,
     and the insertion fails.  To avoid that, you can always create a fresh object in the insertOne - e.g. `await users.insertOne({...userObj});`
  */
  console.log(
    "1. Insert a New Document into the Users Collection: Practice adding a new user document to the users collection. Include fields name and email."
  );
  let userObj = { name: "Lisa Simpson", email: "lisasimpson@gmail.com" };
  const insertUserResult = await users.insertOne(userObj);
  console.log(`Inserted user id: ${insertUserResult.insertedId}\n`);

  // -------------------------------------------------------------------------------------------------------------------------

  // READ
  console.log("\nREAD");
  /* 
    1. Find all movies directed by Christopher Nolan.
    In MongoDB Atlas/Compass, in "movies", query "{directors: "Christopher Nolan"}" -> 9 results 
  */

  // Version #1 -> using .toArray() to have the cursor (pointer to the results of the DB query, not the data itself but is a stream of data that can produce it when iterated)
  /* 
  const allChrisNolanMovies = await movies
    .find({
      directors: "Christopher Nolan",
    })
    .project({ _id: 0, title: 1 })
    .toArray();
  console.log("All Christopher Nolan Movies: ", allChrisNolanMovies);
   */
  // VERSION #2 -> loop through the cursor (which is good for huge result sets)
  const allChrisNolanMovies = await movies
    .find({
      directors: "Christopher Nolan",
    })
    .project({ _id: 0, title: 1 });
  console.log(
    "1. Find all movies directed by Christopher Nolan.\nAll Christopher Nolan Movies: "
  );
  for await (const movie of allChrisNolanMovies) {
    console.dir(movie);
  }

  /* 
    2. Find movies that include the genre "Action" and sort (descending) them by year.
    - In MongoDB Atlas/Compass, in "movies", query "{genres: 'Action'}", sort parameter: "{year: -1}" -> 2381 results!
    - NOTE TO SELF:  I added an additional operator to limit the results to 10 so you can run all my prompts at once... the 2381 results means you can't see all the results in the terminal
  */
  const descendingActionMovies = await movies
    .find({ genres: "Action" }) // filter the documents by genre -> inclusive but not restricting to only Action.
    .project({ _id: 0, title: 1, year: 1, genres: 1 }) // restricting what fields we want to see per document
    .sort({ year: -1 }) // sort by year descending (highest to lowest)
    .limit(10); // NOTE:  the limit operator is optional!  I added it because the output of this one is too long and I wanted to see the results of my other code too.
  console.log(
    '\n2. Find movies that include the genre "Action" and sort (descending) them by year.\nAll "Action Movies sorted by year descending: '
  );
  for await (const movie of descendingActionMovies) {
    console.dir({
      title: movie.title,
      year: movie.year,
      genres: movie.genres,
    }); // NOTE: without explicitly creating a new ordered object, e.g. console.dir(movie), the ordering of the fields is NOT guaranteed.  I did this for readability :)
  }

  /*
    3. Find movies with an IMDb rating greater than 8 and return only the title and IMDB information.
    - In MongoDB Atlas/Compass, in "movies", query "{"imdb.rating": {$gt: 8}}", project "{_id: 0, title: 1, imdb: 1}", optional -> Limit: 10
  */
  const moviesRatedAbove8 = await movies
    .find({ "imdb.rating": { $gt: 8 } })
    .project({ _id: 0, title: 1, imdb: 1 })
    .limit(10); // NOTE:  the limit operator is optional!  I added it because the output of this one is too long and I wanted to see the results of my other code too.
  console.log(
    "\n\n3. Find movies with an IMDb rating greater than 8 and return only the title and IMDB information.\nAll movies with an IMDb rating greater than 8:"
  );
  for await (const movie of moviesRatedAbove8) {
    console.dir({
      title: movie.title,
      imdb: movie.imdb,
    });
  }

  /*
    4. Find movies that starred both "Tom Hanks" and "Tim Allen".
    - NOTE: $all will find movies with a cast that includes both "Tom Hanks" and "Tim Allen", but does NOT restrict it to only them
    - In MongoDB Atlas/Compass, in "movies", query "{cast : {$all: ['Tom Hanks', "Tim Allen"]} }", project: "{_id: 0, title: 1, cast: 1}" -> 5 results 
  */
  const moviesWithHanksandAllen = await movies
    .find({ cast: { $all: ["Tom Hanks", "Tim Allen"] } })
    .project({ _id: 0, title: 1, cast: 1 });
  console.log(
    '\n\n4. Find movies that starred both "Tom Hanks" and "Tim Allen".\nAll movies starring both "Tom Hanks" and "Tim Allen": '
  );
  for await (const movie of moviesWithHanksandAllen) {
    console.dir({
      title: movie.title,
      cast: movie.cast,
    });
  }

  /*
    5. Find movies that starred both and only "Tom Hanks" and "Tim Allen".
    - NOTE: we pair an additional operator to the object for filtering - $size: 2 to ensure only those two are allowed.
    - In MongoDB Atlas/Compass, in "movies", query "{ $all: ["Tom Hanks", "Tim Allen"], $size: 2 }", project: "{_id: 0, title: 1, cast: 1}" -> 0 results 
  */
  const moviesWithHanksandAllenOnly = await movies
    .find({ cast: { $all: ["Tom Hanks", "Tim Allen"], $size: 2 } })
    .project({ _id: 0, title: 1, cast: 1 })
    .toArray();
  console.log(
    '\n5. Find movies that starred both and only "Tom Hanks" and "Tim Allen".\nAll movies starring ONLY "Tom Hanks" and "Tim Allen": ',
    moviesWithHanksandAllenOnly
  );

  /* 
    6. Find comedy movies that are directed by Steven Spielberg.
    - In MongoDB Atlas/Compass, in "movies", query: "{ directors: "Steven Spielberg", genres: "Comedy"}", project: "{ _id: 0, title: 1, directors: 1, genres: 1 }" -> 4 results
    - NOTE TO SELF: this example illustrates filtering by multiple criteria
  */
  const comedyMoviesDirectedBySpielberg = await movies
    .find({
      directors: "Steven Spielberg",
      genres: "Comedy",
    })
    .project({ _id: 0, title: 1, directors: 1, genres: 1 })
    .toArray();
  console.log(
    '\n6. Find comedy movies that are directed by Steven Spielberg.\nAll movies directed by "Steven Spielberg": ',
    comedyMoviesDirectedBySpielberg
  );

  // -------------------------------------------------------------------------------------------------------------------------

  // UPDATE
  console.log("\nUPDATE");
  /* 
    1. Add a new field "available_on" with the value "Sflix" to "The Matrix".
  */
  const matrixQuery = { title: "The Matrix" };
  const updateAvailableOnField = { $set: { available_on: "Sflix" } };
  const updatedMatrixResult = await movies.updateOne(
    matrixQuery,
    updateAvailableOnField
  );
  console.log(
    '\n1. Updated available_on field to "Sflix" for "The Matrix"',
    updatedMatrixResult
  );
  // NOTE: in the updatedMatrixResult - the matchedCount should always be true if it correctly located the record, and modifiedCount === 1 if the update actually changed the document.  Thus, if the document is already up-to-date, modifiedCount === 0.

  /*
    2. Increment the metacritic of "The Matrix" by 1.
    - NOTE TO SELF:  See "Update Operators" - https://www.mongodb.com/docs/v7.0/reference/mql/update/#std-label-update-operators
  */
  const updateMetacriticField = { $inc: { metacritic: 1 } };
  const updatedMatrixMetacriticResult = await movies.updateOne(
    matrixQuery,
    updateMetacriticField
  );
  console.log(
    '\n2. Incremented metacritic field for "The Matrix"',
    updatedMatrixMetacriticResult
  );

  /* 
    3. Add a new genre "Gen Z" to all movies released in the year 1997.
    - NOTE TO SELF: verify the results in MongoDB Compass -> query: { year: 1997 }, check that "Gen Z" is in the genres
  */
  const year97MoviesFilter = { year: 1997 };
  const updateGenreQuery = { $addToSet: { genres: "Gen Z" } }; // WARNING: do not use $set because that will overwrite existing genres, we only want to "add to set"
  const updateGenreResult = await movies.updateMany(
    year97MoviesFilter,
    updateGenreQuery
  );
  console.log(
    '\n3. Add a new genre "Gen Z" to all movies released in the year 1997.'
  );
  console.log(
    `${updateGenreResult.modifiedCount} movies from year 1997 were updated with Gen Z genre!`
  ); // NOTE:  this is only 439 when it first runs, it's 0 after because there's no NEW update.

  /*
    4. Increase IMDb rating by 1 for all movies with a rating less than 5.
  */
  const imdbRatingFilter = { "imdb.rating": { $lt: 5 } }; // filters for movies with IMDB rating less than 5
  const updateRatingQuery = { $inc: { "imdb.rating": 1 } }; // increments IMDB rating by 1
  const updatedIMDBResult = await movies.updateMany(
    imdbRatingFilter,
    updateRatingQuery
  );
  console.log(
    "\n4. Increase IMDb rating by 1 for all movies with a rating less than 5."
  );
  console.log(
    `${updatedIMDBResult.modifiedCount} movies had their IMDb rating increased by 1.`
  ); // this is only 1215 the first time it runs...

  // -------------------------------------------------------------------------------------------------------------------------

  // DELETE
  console.log("\nDELETE");
  /*
    1. Delete a comment with a specific ID.
    - NOTE TO SELF:  pick a new ObjectId when re-running this to see it work... Recommended to see "comments" table in Compass then pick an ID.  Make sure to copy the ObjectId text too!
  */
  const docId = new ObjectId("5a9427648b0beebeb69579e7");
  const query = { _id: docId };
  const deletedCommentResult = await comments.deleteOne(query);
  console.log("\n1. Delete a comment with a specific ID.");

  // print a message to indicate whether the operation deleted a document
  if (deletedCommentResult.deletedCount === 1) {
    console.log(
      `Successfully deleted comment document with an id of '${docId}`
    );
  } else {
    console.log(
      `Could not locate the comment document with id: ${docId}.  Deleted 0 documents.`
    );
  }

  /* 
    2. Delete all comments made for "The Matrix".
  */
  // STEP #1:  Find the movie_id of the Matrix movie from the "movies" table
  console.log('\n2. Delete all comments made for "The Matrix".');
  const matrixMovie = await movies.findOne(
    { title: "The Matrix" },
    { projection: { _id: 1 } }
  );
  if (!matrixMovie) {
    console.log("The Matrix movie was not found!");
  }
  const matrixMovieId = matrixMovie._id;
  console.log("The Matrix _id: ", matrixMovieId); // should get 'new ObjectId('573a139bf29313caabcf3d23')'

  // // STEP #2: Delete all comments for that movie
  const deleteResult = await comments.deleteMany({ movie_id: matrixMovieId });
  console.log(
    `${deleteResult.deletedCount} comments were deleted for the Matrix.`
  ); // 138 comments the first time this is run!  it will be 0 for subsequent runs though :(

  /* 
    3. Delete all movies that do not have any genres.
  */
  console.log("\n3. Delete all movies that do not have any genres.");
  const deleteNoGenreMoviesResult = await movies.deleteMany({
    $or: [
      { genres: { $exists: false } }, // field is missing -> this is the only one in Compass I could see 108 records...
      { genres: { $size: 0 } }, // array exists but is empty -> couldn't find any documents like this
    ],
  });

  console.log(
    `${deleteNoGenreMoviesResult.deletedCount} movies without genres were deleted.\n`
  ); // will be 108 records on the first run.  Subsequent runs will have 0 since already deleted...

  // -------------------------------------------------------------------------------------------------------------------------

  // AGGREGATE
  console.log("AGGREGATE");
  /*
    1. Aggregate movies to count how many were released each year and display from the earliest year to the latest.
    - This means we want to: (1) Find out how many movies were released each year, and then (2) sort them from earliest year to latest.
  */
  const moviesPerYear = await movies
    .aggregate([
      {
        $group: { _id: "$year", count: { $sum: 1 } },
        // group movies by year and count them.
        // (1) `"_id: $year"` -> groups movies by the year field,
        // (2) `count: { $sum: 1 }` adds 1 for each movie in that year
        // WARNING: Whatever you put in the `_id` field becomes the key for each group, and is stored as such.
      },
      {
        $sort: { _id: 1 },
        // This sorts the years from earliest to latest (ascending order)
        // WARNING:  `_id` in aggregation is NOT the same as the document `_id` unless explicitly used
      },
      {
        $project: {
          _id: 0, // we do not want the actual `_id` of the records
          year: "$_id", // we use the year, which was our aggregation `_id`, to get the year again
          count: 1,
        },
      },
    ])
    .toArray();
  console.log(
    "\n1. Aggregate movies to count how many were released each year and display from the earliest year to the latest.",
    moviesPerYear
  );

  /*
    2. Calculate the average IMDb rating for movies grouped by director and display from highest to lowest.
    - This means we need to: 
      (1) Some movies have multiple directors -> if we want to calc avg rating per director, we need **one document per director**
      (2) group by the names of directors, and calculate the average IMDb rating for each director, 
      (3) sort in descending order (highest to lowest)
    - Helpful Docs:
      (1) https://www.mongodb.com/docs/manual/reference/operator/aggregation/unwind/
      (1b) $unwind example: https://www.mongodb.com/docs/manual/reference/operator/aggregation/unwind/#examples
      (2) $group example: https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/
      (3) $sort example: https://www.mongodb.com/docs/manual/reference/operator/aggregation/sort/
      (4) $project example (for formatting): https://www.mongodb.com/docs/manual/reference/operator/aggregation/project/
  */
  const avgDirectorIMDb = await movies
    .aggregate([
      { $unwind: "$directors" }, // if movie has multiple directors in an array, we separate one document per director
      // -> e.g. movie with directors: ["Steven Spielberg", "Tim Burton"] -> unwind makes two records where there's only one director each - 1 Steven, 1 Tim
      { $group: { _id: "$directors", avgRating: { $avg: "$imdb.rating" } } }, // (1) '_id: "$directors"' -> group by director name, 'avgRating: { $avg: "imdb.rating" }' -> computes the avg of all ratings for this director
      { $sort: { avgRating: -1 } }, // sorts descending so highest avg rating first
      { $project: { _id: 0, directors: "$_id", avgRating: 1 } }, // reassigned aggregation id `_id` to directors, and set to see directors and avgRating
    ])
    .toArray();
  console.log(
    "\n2. Calculate the average IMDb rating for movies grouped by director and display from highest to lowest.",
    avgDirectorIMDb
  );

  process.exit(0);
};

runDatabaseQueries();
