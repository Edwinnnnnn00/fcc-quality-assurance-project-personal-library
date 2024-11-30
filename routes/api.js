/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";
const { v4: uuidv4 } = require('uuid');

module.exports = function (app, myDataBase) {

  app
    .route("/api/books")
    .get(function (req, res) {
      // Retrieve all books from the database
      myDataBase.find({}).toArray((err, books) => {
        if (err) return next(err);

        res.json(books);
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      });
    })

    .post(function (req, res, next) {
      const title = req.body.title;
      const id = uuidv4();
      const hash = id.replace(/-/g, "");

      if( !title ) {
        return res.send('missing required field title');
      }

      myDataBase.findOne({ title: title }, (err, book) => {
        if (err) return next(err);
        if (book) return res.send(book);

        myDataBase.insertOne(
          {
            comments: [],
            _id: hash,
            title: title,
            commentcount: 0,
            __v: 0,
          },
          (err, doc) => {
            if (err) {
              console.log(err);
              console.log("Unable to add book");
              res.redirect("/");
            } else {
              res.send({
                _id: hash,
                title: title,
              });
            }
          }
        );
      });
      //response will contain new book object including atleast _id and title
    })

    .delete(function (req, res) {
      myDataBase.deleteMany({}, (err, result) => {
        if (err) return next(err);

        if (result.deletedCount === 0) {
          return res.send("no books deleted");
        }

        res.send("complete delete successful");
      })
      //if successful response will be 'complete delete successful'
    });

  app
    .route("/api/books/:id")
    .get(function (req, res) {
      const bookid = req.params.id;

      myDataBase.findOne({ _id: bookid }, (err, book) => {
        if (err) return next(err);
        if (book) { 
          return res.json(book);
        } else {
          return res.send('no book exists');
        }
      });
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(function (req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;

      if (!comment) {
        return res.send('missing required field comment');
      }

      myDataBase.findOne({ _id: bookid }, (err, book) => {
        if (err) return next(err);
        if (book) {
          book.comments.push(comment);
          book.commentcount++;
          book.__v++;
          myDataBase.updateOne(
            { _id: bookid },
            { $set: book },
            (err, doc) => {
              if (err) return next(err);
              res.json(book);
            }
          );
        } else {
          return res.send('no book exists');
        }
      })
      //json res format same as .get
    })

    .delete(function (req, res) {
      const bookid = req.params.id;

      myDataBase.deleteOne({ _id: bookid }, (err, doc) => {
        if (err) return next(err);

        if (doc.deletedCount === 0) {
          return res.send('no book exists');
        }

        res.send('delete successful');
      });
      //if successful response will be 'delete successful'
    });

  // 404 Not Found Middleware
  app.use(function (req, res, next) {
    res.status(404).type("text").send("Not Found");
  });
};
