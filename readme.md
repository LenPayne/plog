PostLog || PayneLog == plog
===========================

This project is the back-end for my personal website. It's written from hand using
the MEAN stack ([MongoDB](http://www.mongodb.org), [Express](http://www.expressjs.com),
[AngularJS](http://www.angularjs.org), [Node.js](http://www.nodejs.org)).

This is my first experience using MongoDB, so there are some quirks that I'm not
used to. Some basic configuration notes for the DB:

* The **plog_sessions** collection has a TTL Index set on the expires field.
* The **plog_users** collection has a Unique Index set on the user field.
* The **plog_posts** collection has a Unique Index set on the title field.

See this in the wild at my personal website, [www.LenPayne.ca](http://www.lenpayne.ca).

TODO List
---------

The following major features are planned but not yet functional:

* ~~Editing Posts~~ (June 2, 2014)
* "Sticky" Posts
* Excerpts for Long Posts
* Better Authoring Tools for Posts (WYSIWYG, MD)

The following minor features are planned but not yet functional:

* Session Keep-Alive (My session timed out while I was writing a post)
* Post Titles as Title-Tags in Post-View Mode
* Re-Structuring of the Security System (relying too much on the HTTPS I haven't implemented yet)
* Switch to HTTP Basic Auth to retrieve login instead of GET tokens
* Add feedback for failed login attempts
