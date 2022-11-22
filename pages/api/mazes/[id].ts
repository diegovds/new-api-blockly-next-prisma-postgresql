import { NextApiHandler } from "next";
import prisma from "../../../libs/prisma";

// Reading maze info
const handlerShow: NextApiHandler = async (req, res) => {
  const { id } = req.query;

  const maze = await prisma.maze.findUnique({
    where: {
      id: parseInt(id as string),
    },
  });

  if (maze) {
    res.json({ data: maze });
    return;
  }

  res.json({ error: "Maze não encontrado" });
};

/* Updating maze info
// falta fazer a atualização e exclusão da imagem no amazon S3
const handlerUpdate: NextApiHandler = async (req, res) => {
  const {
    name,
    image,
    levels,
    executions,
    conclusions,
    url_image,
    code,
    created_at,
  } = req.body;
  const { id } = req.query;

  const updatedMaze = await prisma.maze
    .update({
      where: {
        id: parseInt(id as string),
      },
      data: {
        name,
        image,
        levels,
        executions,
        conclusions,
        url_image,
        code,
        created_at,
      },
    })
    .catch((e) => {
      res.json({ error: e.meta });
    });

  if (updatedMaze) {
    res.json({ message: "Maze atualizado com sucesso", data: updatedMaze });
    return;
  }
};

// Deleting maze info
const handlerDestroy: NextApiHandler = async (req, res) => {
  const { id } = req.query;

  const deletedMaze = await prisma.maze
    .delete({
      where: {
        id: parseInt(id as string),
      },
    })
    .catch((e) => {
      res.json({ error: e.meta });
    });

  if (deletedMaze) {
    res.json({ message: "Maze deletada com sucesso", data: deletedMaze });
    return;
  }
};

// Inserting new maze
// falta fazer a inserção da imagem no amazon S3
const handlerStore: NextApiHandler = async (req, res) => {
  const { name, image, levels } = req.body;
  const { id } = req.query;

  const newMaze = await prisma.maze
    .create({
      data: {
        name,
        image,
        levels,
        user_id: parseInt(id as string),
      },
    })
    .catch((e) => {
      res.json({ error: e });
    });

  if (newMaze) {
    res.status(201).json({ status: true, data: newMaze });
  }
};*/

const handler: NextApiHandler = (req, res) => {
  switch (req.method) {
    case "GET":
      handlerShow(req, res);
      break;
    /*
    case "PUT":
      handlerUpdate(req, res);
      break;
    case "DELETE":
      handlerDestroy(req, res);
      break;
    case "POST":
      handlerStore(req, res);
      break;*/
  }
};

export default handler;
