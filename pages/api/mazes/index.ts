import nextConnect from "next-connect";
import multer from "multer";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../libs/prisma";

import cors from "cors";

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

apiRoute.use(multer().any(), cors());

// Getting all mazes
apiRoute.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const mazes = await prisma.maze.findMany({
    orderBy: {
      created_at: "desc",
    },
  });

  res.status(200).json({ data: mazes });
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
