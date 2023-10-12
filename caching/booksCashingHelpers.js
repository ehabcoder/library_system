import myCache from "./caching.js";

const updatingCacheAfterEditing = (req, updatedBook) => {
  // After updating a Book we update the cache
  if (myCache.get("books")) {
    let cachedBooks = JSON.parse(myCache.get("books"));
    const bookUpdatedIndex = cachedBooks
      .map((book) => book._id)
      .indexOf(req.params.id);
    cachedBooks[bookUpdatedIndex] = updatedBook;
    myCache.set("books", JSON.stringify(cachedBooks));
  }
};

const updatingCacheAfterDeleting = (req) => {
  // After creating new Book we have to update our cache.
  if (myCache.get("books")) {
    let cachedBooks = JSON.parse(myCache.get("books"));
    cachedBooks = cachedBooks.filter((book) => book._id !== req.params.id);
    myCache.set("books", JSON.stringify(cachedBooks));
  }
};

const updatingCacheAfterCreating = (createdBook) => {
  // After creating new Book we have to update our cache.
  if (myCache.get("books")) {
    let cachedBooks = JSON.parse(myCache.get("books"));
    cachedBooks.push(createdBook);
    myCache.set("books", JSON.stringify(cachedBooks));
  }
};
export {
  updatingCacheAfterEditing,
  updatingCacheAfterDeleting,
  updatingCacheAfterCreating,
};
