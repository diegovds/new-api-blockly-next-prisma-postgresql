import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { NextApiRequest, NextApiResponse } from "next";

interface MulterRequest extends NextApiRequest {
  file: any;
}

const uploadToFirebase = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: any
) => {
  if (!(req as MulterRequest).file) {
    return next();
  }

  const image = (req as MulterRequest).file;
  const imageName = `${uuidv4()}.${image.originalname.split(".").pop()}`;

  const imageRef = ref(storage, `/${imageName}`);

  const metadata = {
    contentType: "image/" + image.originalname.split(".").pop(),
  };

  await uploadBytes(imageRef, image.buffer, metadata).then(async (snaphsot) => {
    await getDownloadURL(snaphsot.ref).then((url) => {
      (req as MulterRequest).file.key = imageName;
      (req as MulterRequest).file.location = url;
    });
  });

  next();
};

export default uploadToFirebase;
