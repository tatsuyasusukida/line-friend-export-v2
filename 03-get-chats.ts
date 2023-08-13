import { writeFile } from "fs/promises";
import fetch from "node-fetch";

type ResponseBody = {
  list: {
    profile: {
      name?: string;
      nickname?: string;
      iconHash?: string;
    };
  }[];
  next?: string;
};

async function main() {
  let responseBodies: ResponseBody["list"] = [];
  let next: string | null = null;

  for (;;) {
    const params = {
      folderType: "ALL",
      limit: "25",
    };

    const url =
      `https://chat.line.biz/api/v2/bots/${process.env.LINE_CHAT_ID}/chats?` +
      new URLSearchParams(next ? { ...params, next } : params).toString();

    const response = await fetch(url, {
      headers: {
        Cookie: process.env.LINE_CHAT_COOKIE!,
      },
    });

    if (response.status !== 200) {
      console.error(await response.text());
      return;
    }

    const responseBody = await response.json<ResponseBody>();

    if (!responseBody.next) {
      break;
    }

    responseBodies = responseBodies.concat(responseBody.list);
    next = responseBody.next;
  }

  await writeFile(
    "data-03-get-chats.json",
    JSON.stringify(responseBodies, null, 2)
  );
}

main().catch((err) => console.error(err));
