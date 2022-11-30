import nextConnect from "next-connect";
import multer from "multer";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../libs/prisma";

const apiRoute = nextConnect({
  onError(error, req: NextApiRequest, res: NextApiResponse) {
    res
      .status(501)
      .json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req: NextApiRequest, res: NextApiResponse) {
    res.status(405).json({ error: `Method "${req.method}" Not Allowed` });
  },
});

apiRoute.use(multer().any());

apiRoute.options(async (req, res: NextApiResponse) => {
  return res.status(200).json({});
});

// Getting all mazes
apiRoute.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const mazes = await prisma.maze.findMany({
    orderBy: {
      created_at: "desc",
    },
  });
  mazes.forEach((item) => {
    if (item.name.length > 8) {
      item.name = item.name.substr(0, 8);
      item.name = item.name.concat("...");
    }
  });

  res.status(200).json({ data: mazes });
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
