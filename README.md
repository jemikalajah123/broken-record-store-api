# Record Store Challenge API SOLUTION✅


# Enhancing Search Performance & Scalability  

## 🔹 Current Issues:  
While optimizing the record store API, I identified key performance bottlenecks:  
- The `findAll()` method was inefficient, loading all records into memory before filtering.  
- Filtering was done in JavaScript instead of MongoDB queries, leading to slow execution.  
- Frequent database queries increased response times and introduced unnecessary latency.  
- Repeated queries for the same data created unnecessary load on the database.  

## ✅ Optimized Solution:  
To address these issues, I implemented the following improvements:  
- **MongoDB Query Filters:** Directly applied query filters in the `find()` method to optimize data retrieval.  
- **Indexing:** Added indexes on `artist`, `album`, `category`, and `format` to speed up searches.  
- **Pagination:** Implemented `limit` and `skip` to efficiently handle large datasets, reducing unnecessary memory consumption.  

---  

# Fetching Tracklist Data from MusicBrainz API  

## 🔹 Current Issues:  
- Previously, the system lacked automatic tracklist fetching from MusicBrainz, requiring manual entry.  
- The `mbid` field was not effectively used to retrieve track information.  

## ✅ Optimized Solution:  
- Implemented automatic tracklist fetching when a record is created or updated with an `mbid`.  
- Stored the retrieved tracklist in the record model for future reference.  
- Enforced uniqueness checks during record creation and updates to maintain data integrity.  

## ✅ Benefits:  
- Reduces manual data entry.  
- Ensures tracklist accuracy and consistency.  

---  

# Order System Implementation  

## 🔹 Requirements Addressed:  
To streamline order management, I implemented:  
- Order placement functionality.  
- Stock validation before processing orders.  
- Automatic stock deduction upon successful order completion.  

## ✅ Benefits:  
- Prevents overselling by ensuring stock availability.  
- Keeps inventory updated in real time.  
- Provides APIs to fetch all orders and retrieve single order details.  

---  

# Implementing Caching for Faster Queries  

## 🔹 Caching Strategy:  
To improve query performance and reduce database load, I integrated **Redis caching** with a **cache-first approach**:  

- **Application-Level Caching:** Frequently accessed records are cached in Redis.  
- **Query Caching Workflow:**  
  1. Check Redis before querying MongoDB.  
  2. If data is found in cache, return it immediately.  
  3. If not found, fetch from MongoDB, store in Redis, and return the result.  

## ✅ Benefits:  
- Reduces database query load.  
- Improves response times for frequently accessed data.  
- Enhances system scalability by leveraging caching mechanisms.  

---  

# Restructuring the Project Setup for Scalability & Maintainability  

## 🔹 Issues with Previous Project Structure:  
- The project structure was not modular, leading to tight coupling of components.  
- External service integrations were scattered across different files, making maintenance difficult.  
- Controllers contained business logic, making them less readable and harder to test.  
- DTOs (Data Transfer Objects) were missing, leading to inconsistent data handling.  
- Imports were messy due to a lack of centralized index files.  

## ✅ Restructured Project Setup:  

### 1. **Modularization:**  
- **Third-Party Module:** Handles all external service integrations (e.g., MusicBrainz API, Redis).  
- **Order Module:** Contains order-related controllers, services, and DTOs.  
- **Shared Module:** Includes reusable utilities like HTTP interceptors, response formatters, and validation helpers.  

### 2. **Controller Cleanup:**  
- Moved authentication logic into a dedicated **AuthService**, keeping controllers clean.  
- Separated order-related logic into **OrderService** to ensure single responsibility.  

### 3. **Introduced DTOs (Data Transfer Objects):**  
- Standardized data structures for request and response payloads.  
- Improved validation and type safety, reducing the risk of invalid data processing.  

### 4. **Created Root Index Files:**  
- Each module now has an `index.ts` file to aggregate exports.  
- Simplifies imports and keeps the codebase clean.  

## ✅ Benefits of the New Structure:  
- **Improved Code Readability & Maintainability:** Clear separation of concerns makes it easier to manage and extend the application.  
- **Better Scalability:** The modular approach allows new features to be added without disrupting existing functionality.  
- **Easier Testing:** Services and controllers are now independent, making unit testing more straightforward.  
- **Clean & Organized Imports:** The use of root `index.ts` files reduces import clutter and improves maintainability.  

---  

# Summary  

By implementing these optimizations and restructuring the project, I significantly improved performance, maintainability, and scalability:  
✅ Faster search queries with MongoDB optimizations.  
✅ Automatic tracklist fetching for better data accuracy.  
✅ Efficient order management with stock validation.  
✅ Improved response times with Redis caching.  
✅ Clean, modular project structure for long-term maintainability. 
✅ 100% Test coverage.   

These changes enhance system efficiency and make it easier to scale and maintain over time. 🚀

# Installation

### Install dependencies:

```bash
$ npm install
````

### Docker for MongoDB Emulator
To use the MongoDB Emulator, you can start it using Docker:
```
npm run mongo:start
```
This will start a MongoDB instance running on your local machine. You can customize the settings in the Docker setup by modifying the docker-compose-mongo.yml if necessary. In the current configuration, you will have a MongoDB container running, which is accessible at localhost:27017.
This mongo url will be necessary on the .env file, with example as follows:

```
MONGO_URL=mongodb://localhost:27017/records
```
This will point your application to a local MongoDB instance.

### MongoDB Data Setup
The data.json file contains example records to seed your database. The setup script will import the records from this file into MongoDB.

To set up the database with the example records:

```
npm run setup:db
```
This will prompt the user to cleanup (Y/N) existing collection before importing data.json


#### data.json Example
Here’s an example of the data.json file that contains records:
```
[
    {
        "artist": "Foo Fighters",
        "album": "Foo Fighers",
        "price": 8,
        "qty": 10,
        "format": "CD",
        "category": "Rock",
        "mbid": "d6591261-daaa-4bb2-81b6-544e499da727"
  },
  {
        "artist": "The Cure",
        "album": "Disintegration",
        "price": 23,
        "qty": 1,
        "format": "Vinyl",
        "category": "Alternative",
        "mbid": "11af85e2-c272-4c59-a902-47f75141dc97"
  },
]
```

### Running the App
#### Development Mode
To run the application in development mode (with hot reloading):

```
npm run start:dev
```
#### Production Mode
To build and run the app in production mode:

```
npm run start:prod
```

### Tests
#### Run Unit Tests
To run unit tests:

```
npm run test
```
To run unit tests with code coverage:

```
npm run test:cov
```
This will show you how much of your code is covered by the unit tests.
#### Run End-to-End Tests
To run end-to-end tests:
```
npm run test:e2e
```
Run Tests with Coverage


Run Linting
To check if your code passes ESLint checks:

```
npm run lint
```
This command will show you any linting issues with your code.

