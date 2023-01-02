import nextConnect from "next-connect";
import multerConfig from "../../../utils/multerConfig";
import { NextApiRequest, NextApiResponse } from "next";
const Generator = require("license-key-generator");
import upFire from "../../../utils/upFire";
import takePrintscreen from "../../../utils/takePrintscreen";
import removeFromFirebase from "../../../utils/removeFromFirebase";
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

apiRoute.use(multerConfig.single("image"), upFire);

apiRoute.options(async (req, res: NextApiResponse) => {
  return res.status(200).json({});
});

// Reading maze info
apiRoute.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  interface data {
    id: number;
    name: string;
    code: string;
    levels: JSON;
    image: string;
    url_image: string;
    executions: number;
    conclusions: number;
    created_at: string;
    username: string;
    thumbnail_name: string | null;
    thumbnail_url: string | null;
  }

  const maze = await prisma.maze.findUniqueOrThrow({
    where: {
      id: parseInt(id as string),
    },
    include: { user: true },
  });

  let treatedData: data = {
    id: maze.id,
    name: maze.name,
    code: maze.code!,
    levels: JSON.parse(JSON.stringify(maze.levels)),
    image: maze.image,
    url_image: maze.url_image!,
    thumbnail_name: maze.thumbnail_name,
    thumbnail_url: maze.thumbnail_url,
    executions: maze.executions!,
    conclusions: maze.conclusions!,
    created_at: new Date(maze.created_at).toLocaleDateString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    }),
    username: maze.user.username,
  };

  if (maze) {
    res.json({ data: treatedData });
    return;
  }
});

// Updating maze info
apiRoute.put(async (req: any, res: NextApiResponse) => {
  const { name, levels, executions, conclusions, code, created_at } = req.body;
  const { id } = req.query;
  let oldBackground: string | undefined;

  let data: {
    name?: string;
    levels?: JSON;
    image?: string;
    url_image?: string;
    executions?: number;
    conclusions?: number;
    code?: string;
    created_at?: Date;
  } = {};

  const maze = await prisma.maze.findUnique({
    where: {
      id: parseInt(id as string),
    },
    include: { user: true },
  });

  if (!maze) {
    if (req.file) {
      removeFromFirebase(req.file.key);
    }
    res.status(404).json({ message: "Maze não encontrado" });
  }

  if (req.file) {
    oldBackground = maze?.image;
    data.image = req.file.key;
    data.url_image = req.file.location;
  }

  if (name) {
    data.name = name;
  }

  if (code) {
    data.code = code;
  }

  if (executions) {
    data.executions = parseInt(executions as string);
  }

  if (conclusions) {
    data.conclusions = conclusions;
  }

  if (levels) {
    data.levels = levels;
  }

  if (created_at) {
    data.created_at = created_at;
  }

  const updatedMaze = await prisma.maze
    .update({
      where: {
        id: parseInt(id as string),
      },
      data: {
        name: data.name,
        image: data.image,
        url_image: data.url_image,
        created_at: data.created_at,
        conclusions: data.conclusions,
        code: data.code,
        executions: data.executions,
        levels: JSON.stringify(data.levels),
      },
    })
    .catch((e) => {
      if (oldBackground) {
        removeFromFirebase(req.file.key);
      }

      res.json({ error: e.meta });
    });

  if (updatedMaze) {
    if (oldBackground) {
      removeFromFirebase(oldBackground);
    }

    res.json({ message: "Maze atualizado com sucesso", data: updatedMaze });
    return;
  }
});

// Deleting maze info
apiRoute.delete(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  const maze = await prisma.maze.findUnique({
    where: {
      id: parseInt(id as string),
    },
    include: { user: true },
  });

  if (maze) {
    const deletedMaze = await prisma.maze
      .delete({
        where: {
          id: parseInt(id as string),
        },
      })
      .catch((e) => {
        res.status(400).json({ e });
      });

    if (deletedMaze) {
      removeFromFirebase(maze.image);
      removeFromFirebase(maze.thumbnail_url);

      res.json({ message: "Maze deletado com sucesso", data: deletedMaze });
      return;
    }
  }
  res.status(404).json({ message: "Maze não encontrado" });
});

// Inserting new maze
apiRoute.post(async (req: any, res: NextApiResponse) => {
  const { name, levels } = req.body;
  const { id } = req.query;

  const { thumbnailName, thumbnailUrl } = await takePrintscreen(
    levels,
    req.file.location
  );

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
          image: req.file.key,
          url_image: req.file.location,
          thumbnail_name: thumbnailName,
          thumbnail_url: thumbnailUrl,
          levels,
          user_id: parseInt(id as string),
        },
      })
      .catch((e) => {
        removeFromFirebase(req.file.key);
        removeFromFirebase(thumbnailUrl);
        res.status(400).json({ error: e });
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
