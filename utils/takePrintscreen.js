import puppeteer from "puppeteer";
const chromium = require("chromium");
const sharp = require("sharp");
import upFireThumbnail from "./upFireThumbnail";

const takePrintscreen = async (levels, url_image) => {
  let buffer, bufferNewDimension;

  const mazeGameUrl =
    "https://myblocklymaze-game.vercel.app/maze.html?levels=" +
    levels +
    "&url_image=" +
    url_image +
    "&reset=1&botaoAjuda=1";

  const browser = await puppeteer.launch({
    executablePath: chromium.path,
  });
  const page = await browser.newPage();
  await page.goto(mazeGameUrl, {
    waitUntil: "networkidle0",
  });

  async function x() {
    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        const imageBuffer = await page.screenshot({
          clip: {
            x: 0,
            y: 0,
            width: 577,
            height: 556,
          },
        });
        resolve(imageBuffer);
        browser.close();
      }, 1000);
    });
  }

  await x().then((done) => {
    buffer = done;
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
