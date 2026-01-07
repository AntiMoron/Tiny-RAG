# Tiny-RAG

What's `Tiny-RAG`?

`Tiny-RAG` is a lite system built with `NestJS` and `React` which aims to provide you fast enough deployment and knowledge management convenience for your side projects.

Sometimes you just don't need that "heavy, complex" system to build a RAG project.

## Just RAG

Sometimes you don't need any AI Agent building system. Q&A is well enough for most scenarios.

Sometimes you just don't need the infrastructure heavy:

- Too much resources included: pg, redis, mysql, milvus, tons of apis needed.
  - This project only uses limited dependencies mysql, nothing else.
- To integrate with new AI provider, either do some pull requests, or you create an issue for the contributor to do that for you, it can usually take up to days waiting.
  - We use DSL to define the abstracted standard based on the best practices amoung all those popular AI provider. (e.g. openAI's `/v1/chat/completion`. P.S. Why still no one pointing that this "v1" design is trash? Is it really good enough for isolation between versions? BTW almost 3 years past, where's the V2 api. I don't think it's a good idea to bring a over-designed pattern to a not yet planned thing. It only makes things more complicated.)
- Once you decide to modify codes, you'll still run into troubles of having no clue about the project at all.
  - Hereby I suggest a pattern called `IDD(interface driven development)`. You just get to know those simple enough interfaces, all you need to do is to implement the corresponding interfaces that you want to modify/enhance. Typescript will give you the proper instructions.

## Features

> I'll try to drain my rest time on this project. So we'll only do the features below to make sure it keeps as `Tiny` as possible.

1. Prepare knowledge-base.
   1. Upload knowledges:
      1. Sync from the most popular online docs. e.g. Google doc, Feishu doc.(I'm a Chinese, have to mention Feishu is really popular amoung Chinese companies, which is produced by Tiktok's mother company - ByteDance.)
         1. sync interval configuration
         2. Media file hosting.
      2. Upload PDFs
      3. a P.S.: We won't do any composing knowledge ability, for that's already been done nicely by Google Docs, Microsoft Office. Let's not be silly asking for those functionalities.
   2. Split docs into Chunks.
   3. Embedding all those chunks.(Removing stop keywords.)
   4. Index all those embedded results.
   5. Store them into database.
   6. An input box as a way to test if knowledges can be retrived correctly
2. API management:
   1. You just use this system to build up some knowledge ability. Actually if you want to make `Tiny-RAG` be used by your side project, you'll need to create some API keys to make RPCs.
3. AI integrations: To integrate with any AI provider you want.
   1. Popular AI providers: OpenAI's ChatGPT, Google's Gemini, OpenRouter, etc.
   2. Customized AI providers: there're always excellent AI providers we haven't known yet. So follow our `IDD` pattern you'll feel it integrated easily.
      1. DSL:
         1. URL: path, host configuration
         2. Way it should be called:
         3. Result mapping: You can map fields in the results to our pre-defined data interface. P.S. No matter what results it returned eventually, make sure it has everything we asked for in the predefined data interface, otherwise to integrate is impossible.

## Dependencies

We wish `Tiny-RAG` has the ability to be deployed on actual production environment, so we will choose those infrastructures who have the ability to scale on server resources.

### SQL DB

There're two options.

| Value    | Best for                   |
| -------- | -------------------------- |
| 'mysql'  | For Business               |
| 'sqlite' | Small dataset (<10k words) |

What we'll be using `SQL Database` for:

- AI integration configurations.
- Knowledge contents.
- API keys.

> P.S. If you decided to use `sqlite` please make sure your `python` version is `3.9`, so that `pnpm rebuild` can run successfully.

### VectorDB

There're two options.

| Value          | Best for                   |
| -------------- | -------------------------- |
| 'milvus'       | For Business               |
| 'local-vector' | Small dataset (<10k words) |

What we'll be using `Milvus` for:

- Knowledge retrieving.

## Development

1. Initiate

```bash
bash ./init.sh
```

2. You'll need two terminals to start nodejs and browserjs.

```bash
cd packages/server && pnpm run start:dev
```

```bash
cd packages/app && pnpm run start:dev
```


## Deployment

1. Build on server and deploy it.

On your server side, execute:

```bash
pnpm run init
pnpm run run:build
```

2. Build on local machine first, then deploy to server.

On your local machine, execute:

```
bash ./build_local.sh
```

Then on your server side, execute:

```bash
pnpm run init
pnpm run run:nobuild
```

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=tiny-rag/tiny-rag&type=date&legend=top-left)](https://www.star-history.com/#tiny-rag/tiny-rag&type=date&legend=top-left)
