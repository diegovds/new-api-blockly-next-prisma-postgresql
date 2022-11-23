import nextConnect from "next-connect";
import multer from "multer";
import { NextApiRequest, NextApiResponse } from "next";
const Generator = require("license-key-generator");
import prisma from "../../../libs/prisma";

/**
 * Falta fazer o upload da imagem no S3
 * Falta fazer a atualização da imagem e remoção da antiga no S3 caso o maze seja atualizado
 * Falta fazer a remoção da imagem no S3 caso o maze seja deletado
 */

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

// Reading maze info
apiRoute.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  const maze = await prisma.maze.findUnique({
    where: {
      id: parseInt(id as string),
    },
    include: { user: true },
  });

  if (maze) {
    res.json({ data: maze });
    return;
  }

  res.json({ error: "Maze não encontrado" });
});

// Updating maze info
apiRoute.put(async (req: NextApiRequest, res: NextApiResponse) => {
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
});

// Deleting maze info
apiRoute.delete(async (req: NextApiRequest, res: NextApiResponse) => {
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
});

// Inserting new maze
apiRoute.post(async (req: any, res: NextApiResponse) => {
  let file = req.files[0];
  const { name, image, levels } = req.body;
  const { id } = req.query;

  const options = {
    type: "random", // default "random"
    length: 6, // default 16
    group: 1, // default 4
    split: "-", // default "-"
    splitStatus: false, // default true
  };
  const codeGen = new Generator(options);
  codeGen.get(async (error: any, code: any) => {
    if (error) return console.error(error);
    //console.log("code=", c);

    const newMaze = await prisma.maze
      .create({
        data: {
          name,
          executions: 0,
          conclusions: 0,
          code: code,
          image: file.originalname,
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
  });
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
