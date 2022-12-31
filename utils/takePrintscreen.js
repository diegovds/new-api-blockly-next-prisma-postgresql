import captureWebsite from "capture-website";
import upFireThumbnail from "./upFireThumbnail";

const takePrintscreen = async (levels, url_image) => {
  const mazeGameUrl =
    "https://myblocklymaze-game.vercel.app/maze.html?levels=" +
    levels +
    "&url_image=" +
    url_image +
    "&reset=1";

  const buffer = await captureWebsite.buffer(mazeGameUrl, {
    width: 1283,
    height: 638,
  });

  const { thumbnailName, thumbnailUrl } = await upFireThumbnail(buffer);

  return { thumbnailName, thumbnailUrl };
};

export default takePrintscreen;
