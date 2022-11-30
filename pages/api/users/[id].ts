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

  try {
    const userById = await prisma.user.findUnique({
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

    userById?.mazes.forEach((item) => {
      if (item.name.length > 8) {
        item.name = item.name.substr(0, 8);
        item.name = item.name.concat("...");
      }
    });

    if (userById) {
      res.json({ data: userById });
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

    userByUid?.mazes.forEach((item) => {
      if (item.name.length > 8) {
        item.name = item.name.substr(0, 8);
        item.name = item.name.concat("...");
      }
    });

    if (userByUid) {
      res.json({ data: userByUid });
      return;
    }

    res.json({ error: "Usuário não encontrado" });
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
