1️⃣ Improve Search Performance & Scalability
🔹 Current Issues:
The findAll() method loads all records into memory before filtering, which is inefficient for a large dataset.
Filtering is done in JavaScript instead of using MongoDB queries, causing slow performance.
✅ Optimized Solution:
Use MongoDB query filters directly in the find() method to reduce unnecessary memory usage.
Indexing on artist, album, category, and format to speed up searches.
Pagination using limit and skip to improve query efficiency.
✅Benefit
Uses MongoDB queries instead of JavaScript filtering.
Uses pagination for large datasets.
Uses regex for case-insensitive searches.


2️⃣ Fetching Tracklist Data from MusicBrainz API
🔹 Current Issues:
No automatic tracklist fetching from MusicBrainz.
The mbid field is not used effectively.
✅ Optimized Solution:
When a record is created/updated, if mbid is provided, fetch the tracklist from MusicBrainz.
Store the tracklist in the record model.

✅ Benefits:
Automatically fetches tracklist when creating/updating a record.
Reduces manual data entry.
Ensures tracklist accuracy.


3️⃣ Order System Implementation
🔹 Requirements:
Allow users to place an order for a record.
Validate stock availability.
Deduct stock quantity upon successful order.
✅ Benefits:
Ensures stock availability before processing orders.
Updates the record quantity upon successful order.


4️⃣ Implement Caching for Faster Queries
Use Redis to cache record searches and tracklists for faster responses.
