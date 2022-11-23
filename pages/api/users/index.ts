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

// Getting all users
apiRoute.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const users = await prisma.user.findMany({
    include: { mazes: true },
  });

  res.status(200).json({ data: users });
});

// Inserting new user
apiRoute.post(async (req: NextApiRequest, res: NextApiResponse) => {
  const { username, uid } = req.body;

  const newUser = await prisma.user
    .create({
      data: {
        username,
        uid,
      },
    })
    .catch((e) => {
      res.json({ error: e.meta });
    });

  if (newUser) {
    res.status(201).json({ status: true, data: newUser });
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
