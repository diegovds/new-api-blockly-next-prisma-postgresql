import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>My BLOCKLY Maze API</title>
        <meta name="description" content="My BLOCKLY Maze API" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to{" "}
          <a href="https://myblocklymaze.vercel.app/">My BLOCKLY Maze</a> API
        </h1>
      </main>
    </div>
  );
}
