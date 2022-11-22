import { NextApiHandler } from "next";
import prisma from "../../../libs/prisma";

// Getting all mazes
const handlerIndex: NextApiHandler = async (req, res) => {
  const mazes = await prisma.maze.findMany();

  res.status(200).json({ data: mazes });
};

const handler: NextApiHandler = (req, res) => {
  switch (req.method) {
    case "GET":
      handlerIndex(req, res);
      break;
  }
};

export default handler;
