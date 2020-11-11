const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");

const basicAuth = require("express-basic-auth");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const formidable = require("formidable");
const fs = require("fs");

require("./db");

const {
  Contact,
  Subscriber,
  Partnership,
  Blog,
  Gallery,
} = require("./db/models");

const auth = basicAuth({
  users: {
    admin: "fcbethel123",
  },
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser("M2gSX4Lry1AYAoWVimrj4onfozdxI81u"));

app.use(express.static(path.join(__dirname, "/client/build")));

app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

const whitelist = [
  "https://fcbethelacademy.com",
  "http://fcbethelacademy.com",
  "http://localhost:3000",
];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors(corsOptions));

app.get("/authenticate", auth, (req, res) => {
  const options = {
    httpOnly: true,
    signed: true,
  };

  res.cookie("user", "admin", options).send({ message: "success" });
});

app.get("/read-cookie", (req, res) => {
  if (req.signedCookies.user) {
    res.send({ authenticated: true });
  } else {
    res.send({ authenticated: false });
  }
});

app.get("/clear-cookie", (req, res) => {
  res.clearCookie("user").end();
});

app
  .route("/api/contact")
  .get(async (req, res) => {
    try {
      const contacts = await Contact.find({}).sort({ createdAt: -1 });
      res.status(200).json({ contacts });
    } catch (err) {
      console.log(err);
    }
  })
  .post(async (req, res) => {
    try {
      if (!req.body.name && !req.body.email && !req.body.phone) {
        throw Error("Please Fill the required fields!");
      }
      const contact = new Contact(req.body);
      contact.save();

      res.status(201).json({ sent: true });
    } catch (err) {
      console.log(err);
      res.json({ sent: false, err });
    }
  });

app.delete("/api/contact/:id", async (req, res) => {
  try {
    await Contact.findByIdAndDelete({ _id: req.params.id });
    res.status(200).send(`Deleted Submission successfully`);
  } catch (err) {
    console.log(err);
  }
});

app.delete("/api/partnership/:id", async (req, res) => {
  try {
    await Partnership.findByIdAndDelete({ _id: req.params.id });
    res.status(200).send(`Deleted Submission successfully`);
  } catch (err) {
    console.log(err);
  }
});

app
  .route("/api/partnership")
  .get(async (req, res) => {
    try {
      const partnerships = await Partnership.find({}).sort({ createdAt: -1 });
      res.status(200).json({ partnerships });
    } catch (err) {
      console.log(err);
    }
  })
  .post(async (req, res) => {
    try {
      if (!req.body.name && !req.body.email && !req.body.phone) {
        throw Error("Please Fill the required fields!");
      }
      const partnership = new Partnership(req.body);
      partnership.save();

      res.status(201).json({ sent: true });
    } catch (err) {
      console.log(err);
      res.json({ sent: false, err });
    }
  });

app
  .route("/api/subscribe")
  .get(async (req, res) => {
    try {
      const subscribers = await Subscriber.find({}).sort({ createdAt: -1 });
      res.status(200).json({ subscribers });
    } catch (err) {
      console.log(err);
    }
  })
  .post(async (req, res) => {
    try {
      const subscribe = new Subscriber(req.body);
      subscribe.save();
      res.status(201).json({ sent: true });
    } catch (err) {
      console.log(err);
      res.json({ sent: false, err });
    }
  });

app.delete("/api/subscribe/:id", async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete({ _id: req.params.id });
    res.status(200).send(`Deleted Submission successfully`);
  } catch (err) {
    console.log(err);
  }
});

var createDateString = () => {
  var m = new Date();
  return (
    m.getUTCFullYear() +
    "-" +
    ("0" + (m.getUTCMonth() + 1)).slice(-2) +
    "-" +
    ("0" + m.getUTCDate()).slice(-2) +
    "-" +
    ("0" + m.getUTCHours()).slice(-2) +
    ":" +
    ("0" + m.getUTCMinutes()).slice(-2) +
    ":" +
    ("0" + m.getUTCSeconds()).slice(-2)
  );
};

app
  .route("/api/blog")
  .get(async (req, res) => {
    try {
      const blogs = await Blog.find({}).sort({ createdAt: -1 });
      res.json(blogs);
    } catch (e) {
      console.log(e);
    }
  })
  .post(async (req, res) => {
    try {
      const form = formidable({
        uploadDir: path.join(__dirname, "/uploads"),
        keepExtentions: true,
      });
      let newFileName;
      form
        .on("fileBegin", (name, file) => {
          newFileName = new Date().getTime() + file.name;
          file.path = path.join(__dirname, "/uploads/", newFileName);
        })
        .parse(req, async (err, fields, file) => {
          const blog = { ...fields };
          if (file.image) {
            blog.image = "/uploads/" + newFileName;
          }

          var m = new Date();

          blog.slug = blog.title.split(" ").join("-") + createDateString();
          const newBlog = new Blog(blog);
          await newBlog.save();

          res.status(201).json({
            msg: "Post has been published successfully!",
            url: blog.slug,
          });
        });
    } catch (e) {
      console.log(e);
    }
  });

app
  .route("/api/blog/:id")
  .get(async (req, res) => {
    try {
      const blog = await Blog.findOne({ slug: req.params.id });
      res.json(blog);
    } catch (e) {
      console.log(e);
    }
  })
  .put(async (req, res) => {
    try {
      const form = formidable({
        uploadDir: path.join(__dirname, "/uploads"),
        keepExtentions: true,
      });
      let newFileName;
      form
        .on("fileBegin", (name, file) => {
          newFileName = new Date().getTime() + file.name;
          file.path = path.join(__dirname, "/uploads/", newFileName);
        })
        .parse(req, async (err, fields, file) => {
          const blog = { ...fields };
          const updatedBlog = await Blog.findOne({ slug: req.params.id });
          if (file.image) {
            updatedBlog.image !== "undefined" &&
              fs.unlinkSync(path.join(__dirname, updatedBlog.image));
            blog.image = "/uploads/" + newFileName;
          } else {
            blog.image = updatedBlog.image;
          }

          await updatedBlog.updateOne(blog);
          await updatedBlog.save();

          res.status(201).json({
            msg: "Post has been updated successfully!",
            url: blog.slug,
          });
        });
    } catch (e) {
      console.log(e);
    }
  })
  .delete(async (req, res) => {
    try {
      console.log(req.params.id);
      const deletedPost = await Blog.findOneAndDelete({ slug: req.params.id });
      if (deletedPost.image !== "undefined") {
        fs.unlinkSync(path.join(__dirname, deletedPost.image));
      }
      res.status(200).send(`Deleted Post: "${deletedPost.title}" Successfully`);
    } catch (e) {
      console.log(e);
    }
  });

app
  .route("/api/gallery")
  .get(async (req, res) => {
    try {
      const gallery = await Gallery.find().sort({ createdAt: -1 });
      res.json(gallery);
    } catch (e) {
      console.log(e);
    }
  })
  .post(async (req, res) => {
    try {
      const form = formidable({
        uploadDir: path.join(__dirname, "/uploads/gallery"),
        keepExtentions: true,
      });
      let uploads = [],
        newFileName;
      form
        .parse(req)
        .on("fileBegin", (name, file) => {
          newFileName = new Date().getTime() + file.name;
          file.path = path.join(__dirname, "/uploads/gallery/", newFileName);

          uploads.push("/uploads/gallery/" + newFileName);
        })
        .on("end", () => {
          uploads.forEach(async (upload) => {
            const file = { src: upload };
            const gallery = new Gallery(file);
            await gallery.save();
          });

          res.status(201).send("File(s) uploaded successfully!");
        });
    } catch (e) {
      console.log(e);
    }
  });

app.delete("/api/gallery/:id", async (req, res) => {
  try {
    console.log(req.params.id);
    await Gallery.findByIdAndDelete(req.params.id);
    res.status(200).send("Deleted Image Successfully");
  } catch (e) {
    console.log(e);
  }
});

app.get("*", (req, res) => {
  res.send("What are you doing here?");
  // res.sendFile(path.join(__dirname, '/client/build/index.html'))
});

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`App is listening on port: ${port}!`));
