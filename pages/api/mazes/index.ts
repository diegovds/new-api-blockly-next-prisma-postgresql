import nextConnect from "next-connect";
import multer from "multer";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../libs/prisma";
import dayjs from "dayjs";

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

// Getting all mazes
apiRoute.get(async (req: NextApiRequest, res: NextApiResponse) => {
  interface data {
    id: number;
    name: string;
    code: string;
    image: string;
    url_image: string;
    created_at: string;
  }

  let treatedData: data[] = [];

  const mazes = await prisma.maze.findMany({
    orderBy: {
      created_at: "desc",
    },
  });

  for (let index = 0; index < mazes.length; index++) {
    const element = mazes[index];

    treatedData.push({
      id: element.id,
      name:
        element.name.length > 8
          ? element.name.slice(0, 8) + "..."
          : element.name,
      code: element.code!,
      image: element.image,
      url_image: element.url_image!,
      created_at: dayjs(element.created_at)
        .locale("pt-br")
        .format("DD/MM/YYYY"),
    });
  }

  res.status(200).json({ data: treatedData });
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
