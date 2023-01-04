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

  async function navegador() {
    return new Promise((resolve, reject) => {
      (async () => {
        const PCR = require("puppeteer-chromium-resolver");
        const option = {
          revision: "",
          detectionPath: "",
          folderName: ".chromium-browser-snapshots",
          defaultHosts: [
            "https://storage.googleapis.com",
            "https://npm.taobao.org/mirrors",
          ],
          hosts: [],
          cacheRevisions: 2,
          retry: 3,
          silent: false,
        };
        const stats = await PCR(option);
        const browser = await stats.puppeteer
          .launch({
            headless: true,
            args: ["--no-sandbox"],
            executablePath: stats.executablePath,
          })
          .catch(function (error) {
            console.log(error);
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
              await browser.close();
            }, 1000);
          });
        }

        await x().then((done) => {
          resolve(done);
        });
      })();
    });
  }

  await navegador().then((done) => {
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
