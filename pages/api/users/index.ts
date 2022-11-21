import { NextApiHandler } from "next";
import prisma from "../../../libs/prisma";

// Getting all users
const handlerIndex: NextApiHandler = async (req, res) => {
  const users = await prisma.user.findMany({
    include: { mazes: true },
  });

  res.status(200).json({ data: users });
};

// Inserting new user
const handlerStore: NextApiHandler = async (req, res) => {
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
};

const handler: NextApiHandler = (req, res) => {
  switch (req.method) {
    case "GET":
      handlerIndex(req, res);
      break;
    case "POST":
      handlerStore(req, res);
      break;
  }
};

export default handler;
