import nextConnect from "next-connect";
import upload from "../../../utils/upload";
import { NextApiRequest, NextApiResponse } from "next";
const Generator = require("license-key-generator");
import aws from "aws-sdk";
import prisma from "../../../libs/prisma";

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET,
  accessKeyId: process.env.AWS_ACCESS,
  region: process.env.AWS_REGIAO,
});

const s3 = new aws.S3({
  /* ... */
});

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

apiRoute.use(upload.single("image"));

apiRoute.options(async (req, res: NextApiResponse) => {
  return res.status(200).json({});
});

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
apiRoute.put(async (req: any, res: NextApiResponse) => {
  const {
    name,
    levels,
    executions,
    conclusions,
    code,
    created_at,
    created_at_pt_br,
  } = req.body;
  const { id } = req.query;

  let data: {
    name?: string;
    levels?: JSON;
    image?: string;
    url_image?: string;
    executions?: number;
    conclusions?: number;
    code?: string;
    created_at_pt_br?: string;
    created_at?: Date;
  } = {};

  const maze = await prisma.maze.findUnique({
    where: {
      id: parseInt(id as string),
    },
    include: { user: true },
  });

  if (maze && req.file) {
    (async () => {
      let params = {
        Bucket: process.env.AWS_BUCKET!,
        Key: maze.image,
      };

      //console.log(`params ->> `, params);

      s3.deleteObject(params, function (error, data) {
        if (error) {
          //console.log(`\nDeleteImageFromS3 error ->> ${error}`);
          return;
        } else {
          //console.log("\ns3.deleteObject data ->> ", data);
          return;
        }
      });
    })();

    data.image = req.file.key;
    data.url_image = req.file.location;
  } else if (!maze && req.file) {
    (async () => {
      let params = {
        Bucket: process.env.AWS_BUCKET!,
        Key: req.file.key,
      };

      //console.log(`params ->> `, params);

      s3.deleteObject(params, function (error, data) {
        if (error) {
          //console.log(`\nDeleteImageFromS3 error ->> ${error}`);
          return;
        } else {
          //console.log("\ns3.deleteObject data ->> ", data);
          return;
        }
      });
    })();

    res.json({ error: "Maze não encontrado" });
  } else if (!maze && !req.file) {
    res.json({ error: "Maze não encontrado" });
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

  if (created_at_pt_br) {
    data.created_at_pt_br = created_at_pt_br;
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
        created_at_pt_br: data.created_at_pt_br,
        conclusions: data.conclusions,
        code: data.code,
        executions: data.executions,
        levels: JSON.stringify(data.levels),
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

  const maze = await prisma.maze.findUnique({
    where: {
      id: parseInt(id as string),
    },
    include: { user: true },
  });

  if (maze) {
    (async () => {
      let params = {
        Bucket: process.env.AWS_BUCKET!,
        Key: maze.image,
      };

      //console.log(`params ->> `, params);

      s3.deleteObject(params, function (error, data) {
        if (error) {
          //console.log(`\nDeleteImageFromS3 error ->> ${error}`);
          return;
        } else {
          //console.log("\ns3.deleteObject data ->> ", data);
          return;
        }
      });
    })();

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
  }

  res.json({ error: "Maze não encontrado" });
});

// Inserting new maze
apiRoute.post(async (req: any, res: NextApiResponse) => {
  const { name, levels } = req.body;
  const { id } = req.query;
  const today = new Date(Date.now());

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
          levels,
          created_at_pt_br: today.toLocaleDateString("pt-BR"),
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
