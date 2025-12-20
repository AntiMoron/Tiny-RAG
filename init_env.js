import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import { randomUUID } from "crypto";

const envFile = path.join(process.cwd(), "./packages/server/.env");

async function procedure(force) {
  if (force || !fs.existsSync(envFile)) {
    const basics = await inquirer.prompt([
      {
        type: "input",
        name: "ADMIN_NAME",
        message: "Login Admin Username: ",
        default: "admin",
      },
      {
        type: "input",
        name: "ADMIN_PASSWORD",
        message: "Login Admin Password: ",
        default: "ilovetinyrag",
      },
      {
        type: "input",
        name: "JWT_SECRET",
        message:
          "Password Salt(Shouldn't modify this after created, better use the default value): ",
        default: randomUUID(),
      },
      {
        type: "input",
        name: "PUBLIC_HOST",
        message:
          "Public host(**Important** decides the domain of images,resources, better use your domain): ",
        default: "http://localhost:3000",
      },
    ]);
    const sqlType = await inquirer.prompt([
      {
        type: "list",
        name: "DATABASE_TYPE",
        message: "database(mysql/sqlite): ",
        choices: ["mysql", "sqlite"],
        default: "sqlite",
      },
    ]);
    let sqlConfig;
    switch (sqlType.DATABASE_TYPE) {
      case "mysql":
        const mysql = await inquirer.prompt([
          {
            type: "input",
            name: "MYSQL_HOST",
            message: "MySQL host: ",
            default: "localhost",
          },
          {
            type: "input",
            name: "MYSQL_PORT",
            message: "MySQL port: ",
            default: "3306",
          },
          {
            type: "input",
            name: "MYSQL_USER",
            message: "MySQL user: ",
            default: "root",
          },
          {
            type: "input",
            name: "MYSQL_PASSWORD",
            message: "MySQL password: ",
            default: "",
          },
          {
            type: "input",
            name: "MYSQL_DATABASE",
            message: "MySQL database: ",
            default: "tiny_rag_db",
          },
        ]);
        sqlConfig = mysql;
        break;
      case "sqlite":
        sqlConfig = {
          SQLITE_FILE_PATH: path.join(
            process.cwd(),
            "./data/sqlite/tiny_rag_db.sqlite"
          ),
        };
        break;
    }

    const redis = await inquirer.prompt([
      {
        type: "input",
        name: "REDIS_URL",
        message: "Redis URL: ",
        default: "redis://localhost:6379",
      },
      {
        type: "input",
        name: "REDIS_PASSWORD",
        message: "Redis password: ",
        default: "",
      },
      {
        type: "input",
        name: "REDIS_DB",
        message: "Redis database: ",
        default: "0",
      },
    ]);
    const vectorDbType = await inquirer.prompt([
      {
        type: "list",
        name: "VECTOR_DB_TYPE",
        message: "vector database(milvus/local-vector): ",
        choices: ["milvus", "local-vector"],
        default: "local-vector",
      },
    ]);
    let otherConfigs;
    const { VECTOR_DB_TYPE } = vectorDbType;
    switch (VECTOR_DB_TYPE) {
      case "milvus":
        otherConfigs = await inquirer.prompt([
          {
            type: "input",
            name: "MILVUS_ADDR",
            message: "milvus addr: ",
            default: "localhost:19530",
          },
          {
            type: "input",
            name: "MILVUS_CHUNK_COLLECTION_NAME",
            message: "milvus chunk collection name: ",
            default: "chunks",
          },
          {
            type: "input",
            name: "MILVUS_COLLECTION_USER_NAME",
            message: "milvus username: ",
            default: "",
          },
          {
            type: "input",
            name: "MILVUS_COLLECTION_PASSWORD",
            message: "milvus password: ",
            default: "",
          },
        ]);
        break;
      case "local-vector":
        otherConfigs = {
          LOCAL_VECTOR_DB_PATH: path.join(
            process.cwd(),
            "./data/local-vector/vectors"
          ),
        };
        break;
    }
    Object.assign(
      basics,
      sqlType || {},
      sqlConfig || {},
      redis || {},
      vectorDbType || {},
      otherConfigs || {}
    );

    console.log(basics, sqlConfig);
    let envContent = "";
    for (const [key, value] of Object.entries(basics)) {
      envContent += `${key}=${value}\n`;
    }
    fs.writeFileSync(envFile, envContent);
    console.log(".env file created successfully.");
  } else {
    console.log(".env file already exists. Skipping initialization.");
  }
}
const force = process.argv.indexOf("--force") >= 0;

procedure(force);
