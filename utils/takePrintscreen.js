import captureWebsite from "capture-website";
const sharp = require("sharp");
import upFireThumbnail from "./upFireThumbnail";

const takePrintscreen = async (levels, url_image) => {
  let bufferNewDimension;

  const mazeGameUrl =
    "https://myblocklymaze-game.vercel.app/maze.html?levels=" +
    levels +
    "&url_image=" +
    url_image +
    "&reset=1&botaoAjuda=1";

  const buffer = await captureWebsite.buffer(mazeGameUrl, {
    width: 577,
    height: 556,
  });

  await sharp(buffer)
    .resize({ width: 700, height: 600, fit: "fill" })
    .toBuffer()
    .then((data) => {
      bufferNewDimension = data;
    });

  const { thumbnailName, thumbnailUrl } = await upFireThumbnail(
    bufferNewDimension
  );

  return { thumbnailName, thumbnailUrl };
};

export default takePrintscreen;
