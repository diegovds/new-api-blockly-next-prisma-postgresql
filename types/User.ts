import { Maze } from "./Maze";

export type User = {
  id: number;
  username: string;
  mazes: Maze[];
};
