import { Maze } from "./Maze";

export type FullMaze = Maze & {
  levels: JSON;
  executions: number;
  conclusions: number;
  username: string;
};
