import { writeFile } from "fs/promises";
import fetch from "node-fetch";

type ResponseBody = {
  userIds: string[];
  next?: string;
};

async function main() {
  let userIds: string[] = [];
  let start: string | null = null;

  for (;;) {
    const params = { limit: "1000" };
    const url =
      "https://api.line.me/v2/bot/followers/ids?" +
      new URLSearchParams(start ? { ...params, start } : params).toString();

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
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

    userIds = userIds.concat(responseBody.userIds);
    start = responseBody.next;
  }

  await writeFile(
    "data-01-follower-ids.json",
    JSON.stringify(userIds, null, 2)
  );
}

main().catch((err) => console.error(err));
