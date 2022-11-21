import { NextApiHandler } from "next";
import prisma from "../../../libs/prisma";

// Reading user info
const handlerShow: NextApiHandler = async (req, res) => {
  const { id } = req.query;

  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(id as string),
    },
    include: { mazes: true },
  });

  if (user) {
    res.json({ data: user });
    return;
  }

  res.json({ error: "Usuário não encontrado" });
};

// Updating user info
const handlerUpdate: NextApiHandler = async (req, res) => {
  const { username, uid } = req.body;
  const { id } = req.query;

  const updatedUser = await prisma.user
    .update({
      where: {
        id: parseInt(id as string),
      },
      data: {
        username,
        uid,
      },
    })
    .catch((e) => {
      res.json({ error: e.meta });
    });

  if (updatedUser) {
    res.json({ message: "User atualizado com sucesso", data: updatedUser });
    return;
  }
};

// Deleting user info
const handlerDestroy: NextApiHandler = async (req, res) => {
  const { id } = req.query;

  const deletedUser = await prisma.user
    .delete({
      where: {
        id: parseInt(id as string),
      },
    })
    .catch((e) => {
      res.json({ error: e.meta });
    });

  if (deletedUser) {
    res.json({ message: "User deletado com sucesso", data: deletedUser });
    return;
  }
};

const handler: NextApiHandler = (req, res) => {
  switch (req.method) {
    case "GET":
      handlerShow(req, res);
      break;
    case "PUT":
      handlerUpdate(req, res);
      break;
    case "DELETE":
      handlerDestroy(req, res);
      break;
  }
};

export default handler;
