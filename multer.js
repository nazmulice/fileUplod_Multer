const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Set up Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");   // Define the destination folder for uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);  // Use the original filename
  },
});

var upload = multer({
  storage: storage,
  limits: {
    fileSize: 2000000, //1 MB
  },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === "file") {
      if (
        file.mimetype === "image/png" ||
        file.mimetype === "image/jpg" ||
        file.mimetype === "image/jpeg"
      ) {
        cb(null, true);
      } else {
        cb("Invalid format of file");
      }
    }
    else if (file.fieldname === "pdfDocFile") {
      if (
        file.mimetype === "application/pdf" ||
        file.mimetype === "application/doc"
      ) {
        cb(null, true);
      } else {
        cb("Invalid format of file");
      }
    }
    else {
      cb("Unexpected error");
    }
  },
});


// Set up your database connection
mongoose.connect("mongodb://127.0.0.1:27017/newMulter", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define a schema for your file documents
const fileSchema = new mongoose.Schema(
  {
      name: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      // path: {
      //   type: String
      // },
      pdf: {
        type: String,
      },
  },
    { timestamps: true },
    { versionKey: false }
);
const File = mongoose.model("File", fileSchema);


var cpUpload = upload.fields([
  { name: "file", maxCount: 5 },
  { name: "pdfDocFile", maxCount: 3 },
]);

app.get("/register", (req, res) => {
  res.status(200).sendFile(__dirname + "/index.html");
});

// Handle file upload route
app.post("/register", cpUpload, async (req, res) => {
  try {
    // Create a new document for the uploaded file
    const file = new File({
      name: req.body.name,
      image: req.files["file"][0].filename,
      pdf: req.files["pdfDocFile"][0].filename,
    });

    await file.save();

    res.status(200).json({
      message: "File uploaded successfully",
      data: file,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while uploading the file" });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
