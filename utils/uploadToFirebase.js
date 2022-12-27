import admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";

const { privateKey } = JSON.parse(process.env.FIREBASE_PRIVATE_KEY);

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
  storageBucket: process.env.FIREBASE_BUCKET,
});

const bucket = admin.storage().bucket();

const uploadToFirebase = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const image = req.file;
  const imageName = `${uuidv4()}.${image.originalname.split(".").pop()}`;

  const file = bucket.file(imageName);

  const stream = file.createWriteStream({
    metadata: {
      contentType: image.mimetype,
    },
  });

  stream.on("error", (e) => {
    console.error(e);
  });

  stream.on("finish", async () => {
    /** tornar a imagem pública */
    await file.makePublic();

    /** obter a URL pública */
    req.file.key = imageName;
    req.file.location = `https://storage.googleapis.com/${process.env.FIREBASE_BUCKET}/${imageName}`;

    next();
  });

  stream.end(image.buffer);
};

export default uploadToFirebase;
