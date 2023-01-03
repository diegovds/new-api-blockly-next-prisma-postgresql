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

// Reading user info
apiRoute.get(async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  interface maze {
    id: number;
    name: string;
    code: string;
    image: string;
    url_image: string;
    created_at: string;
  }

  interface user {
    id: number;
    username: string;
    mazes: maze[];
  }

  let treatedMaze: maze[] = [];

  try {
    const userById = await prisma.user.findUniqueOrThrow({
      where: {
        id: parseInt(id as string),
      },
      include: {
        mazes: {
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });

    if (userById) {
      if (userById.mazes.length !== undefined) {
        for (let index = 0; index < userById.mazes.length; index++) {
          const element = userById.mazes[index];

          treatedMaze.push({
            id: element.id,
            name:
              element.name.length > 8
                ? element.name.slice(0, 8) + "..."
                : element.name,
            code: element.code!,
            image: element.image,
            url_image: element.url_image!,
            created_at: new Date(element.created_at).toLocaleDateString(
              "pt-BR",
              { timeZone: "America/Sao_Paulo" }
            ),
          });
        }
      }

      let treatedUser: user = {
        id: userById.id,
        username: userById.username,
        mazes: treatedMaze,
      };

      res.json({ data: treatedUser });
      return;
    }
  } catch (error) {
    const userByUid = await prisma.user.findFirst({
      where: {
        uid: id as string,
      },
      include: {
        mazes: {
          orderBy: {
            created_at: "desc",
          },
        },
      },
    });

    if (userByUid) {
      if (userByUid.mazes.length !== undefined) {
        for (let index = 0; index < userByUid.mazes.length; index++) {
          const element = userByUid.mazes[index];

          treatedMaze.push({
            id: element.id,
            name:
              element.name.length > 8
                ? element.name.slice(0, 8) + "..."
                : element.name,
            code: element.code!,
            image: element.image,
            url_image: element.url_image!,
            created_at: new Date(element.created_at).toLocaleDateString(
              "pt-BR",
              { timeZone: "America/Sao_Paulo" }
            ),
          });
        }
      }

      let treatedUser: user = {
        id: userByUid.id,
        username: userByUid.username,
        mazes: treatedMaze,
      };

      res.json({ data: treatedUser });
      return;
    }

    res.status(404).json({ message: "Usuário não encontrado" });
  }
});

// Updating user info
apiRoute.put(async (req: NextApiRequest, res: NextApiResponse) => {
  const { username, uid, created_at } = req.body;
  const { id } = req.query;

  const updatedUser = await prisma.user
    .update({
      where: {
        id: parseInt(id as string),
      },
      data: {
        username,
        uid,
        created_at,
      },
    })
    .catch((e) => {
      res.json({ error: e.meta });
    });

  if (updatedUser) {
    res.json({ message: "User atualizado com sucesso", data: updatedUser });
    return;
  }
});

// Deleting user info
apiRoute.delete(async (req: NextApiRequest, res: NextApiResponse) => {
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
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
