🚀 **Welcome to the Broken Record Store API Challenge!** 🚀
===========================================================

Welcome to the **Broken Record Store**—where the records never stop spinning (unless the server goes down). We're proud to present the **award-winning API** that powers our point of sale system. We're constantly looking to improve and innovate. So, we’ve come up with a few **rocket science features** that you, as a top-tier developer, will be tasked with improving.

🏆 **The Award-Winning API** 🏆
-------------------------------

Our **API** provides groundbreaking features like:

*   Saving a record
    
*   Editing a record
    
*   Filtering records by any number of parameters (because who doesn’t love a good filter?)
    

### 🎵 **What is a Record?**

At **Broken Record Store**, a record is much more than just vinyl. It’s the core of our business and the thing that our API interacts with the most. Let’s break down the **record** fields:

#### **Fields in the Record DTO**:

*   **artist**: The artist who made the album. Example: _The Beatles_.
    
*   **album**: The name of the album. Example: _Abbey Road_.
    
*   **price**: The price of the record in your currency. Example: _$20_.
    
*   **qty**: The quantity of records available in stock.
    
*   **format**: The format of the record (e.g., _Vinyl_, _CD_).
    
*   **category**: The genre or category of the record (e.g., _Rock_, _Jazz_).
    
*   **mbid**: The **MusicBrainz Identifier** for the album. This is a **universal identifier** for the album. You can find it at [MusicBrainz](https://musicbrainz.org/). Example: b10bbbfc-cf9e-42e0-be17-e2c3e1d2600d.
    

#### **Categories**:

*   **Rock**
    
*   **Pop**
    
*   **Jazz**
    
*   **Indie**
    
*   **Alternative**
    
*   **Classical**
    
*   **Hip-Hop**
    

#### **Formats**:

*   **Vinyl**
    
*   **CD**
    
*   **Cassette**
    
*   **Digital**
    

### 📚 **What Should Uniquely Identify a Record?**

We believe a **record** should be uniquely identified by a **combination of**:

*   **artist**
    
*   **album**
    
*   **format**
    

The **MBID** from [MusicBrainz](https://musicbrainz.org/) is a **universal identifier** that helps us get more details about the album, like **track listings**. It's like an **ID card** for your record!

🛠️ **Current Problems with the API**
-------------------------------------

Our **production database** currently holds a **huge collection** of **100,000 records**. But unfortunately, searches are a little slow. And when I say **slow**, I mean **like waiting for a needle drop in slow motion**. 🎶

Some of the challenges:

*   **All searches take a long time**, especially as our catalog grows.
    
*   The **API** is **not fetching record details from MusicBrainz** to automatically populate track lists when creating or editing records. This means we're missing out on **rich, detailed data**.
    
*   **Scalability** issues: Searching through **100,000 records** is starting to feel like searching for a needle in a haystack. But worse. 🤦‍♂️
    

💡 **What We Need From You** 💡
-------------------------------

### 1\. **Analyze the Current Setup**

Look through the current API and suggest any **improvements**. Some of the things to focus on:

*   **Improving search performance**.
    
*   **Reducing load times**.
    
*   **Optimizing database queries**.
    

### 2\. **Record Creation with MBID**

When creating a **new record** and providing a **MBID**:

*   We want to **fetch record information** from the MusicBrainz API (use **XML** response format for reference).
    
*   If the **MBID is valid** (i.e., MusicBrainz API returns data), we want to:
    
    *   Extract the **track listing** and store it in the tracklist array in the record model.
        

### 3\. **Record Editing with MBID**

When **editing an existing record** and updating the **MBID**:

*   If the **MBID** provided is **different** than the previous one, repeat the process of fetching track information from MusicBrainz and **update the tracklist**.
    

### 4\. **Create Orders with Record ID + Quantity**

We need to implement the ability to create **orders** for records. An order will need:

*   **Record ID**.
    
*   **Quantity** of records being ordered.
    

🚀 **Extra Tasks to Add?** 🚀
-----------------------------

You can also think of a few improvements or add tasks that will make the **Broken Record Store** API stand out even more:

*   **Pagination** for large sets of records.
    
*   **Caching** record queries for faster access.
    
*   Maybe even an **admin panel** to easily add records to the database? 🤔
    

📝 **Bonus Points** 🎯
----------------------

*   **Code quality**: Clean, well-structured, and modular code.
    
*   **Testing**: Ensure your changes are **fully tested**.
    
    *   **Unit Tests** for your logic.
        
    *   **End-to-End Tests** to make sure the app is fully functional.
        
    *   **Coverage**: Run tests with coverage enabled.
        

🌟 **Have Fun!** 🌟
-------------------

Remember, this challenge is all about **creativity**, **problem-solving**, and **improving the user experience**. The **Broken Record Store** is counting on you to make this **API the best it can be**. We know you’ve got the skills to turn things around, and we can’t wait to see your solution!

Good luck and may your code be bug-free! 🐛💻✨