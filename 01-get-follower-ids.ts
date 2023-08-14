import { writeFile } from "fs/promises";
import fetch from "node-fetch";

/**
 * LINE 公式アカウントを友だち追加したユーザーのリストを取得する API レスポンスのデータ型です。
 * https://developers.line.biz/ja/reference/messaging-api/#get-follower-ids
 */
type ResponseBody = {
  userIds: string[];
  next?: string;
};

/**
 * LINE 公式アカウントを友だち追加したユーザーのリストを出力します。
 */
async function getFollowerIds(): Promise<string[]> {
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
      process.exit(1);
    }

    const responseBody = await response.json<ResponseBody>();

    if (!responseBody.next) {
      break;
    }

    userIds = userIds.concat(responseBody.userIds);
    start = responseBody.next;
  }

  return userIds;
}

async function main() {
  const userIds = await getFollowerIds();

  await writeFile(
    "data-01-follower-ids.json",
    JSON.stringify(userIds, null, 2)
  );
}

main().catch((err) => console.error(err));
