import { Maze } from "./Maze";

export type FullMaze = Maze & {
  levels: JSON;
  executions: number;
  username: string;
};
