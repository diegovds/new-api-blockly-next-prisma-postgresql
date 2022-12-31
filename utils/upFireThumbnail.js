import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const upFireThumbnail = async (buffer) => {
  let downloadUrl;
  const imageName = uuidv4() + ".png";

  const imageRef = ref(storage, `/${imageName}`);

  const metadata = {
    contentType: "image/png",
  };

  await uploadBytes(imageRef, buffer, metadata).then(async (snaphsot) => {
    await getDownloadURL(snaphsot.ref).then((url) => {
      downloadUrl = url;
    });
  });

  return { thumbnailName: imageName, thumbnailUrl: downloadUrl };
};

export default upFireThumbnail;
