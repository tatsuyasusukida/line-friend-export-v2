import { readFile, writeFile } from "fs/promises";
import fetch from "node-fetch";

/**
 * プロフィール情報を取得する API レスポンスのデータ型です。
 * https://developers.line.biz/ja/reference/messaging-api/#get-profile
 */
type ResponseBody = {
  displayName: string;
  userId: string;
  language?: string;
  pictureUrl?: string;
  statusMessage: string;
};

/**
 * ユーザー ID のリストを入力するとプロフィールのリストを出力します。
 */
async function getProfiles(userIds: string[]): Promise<ResponseBody[]> {
  const responseBodies: ResponseBody[] = [];

  for (const userId of userIds) {
    const url = "https://api.line.me/v2/bot/profile/" + userId;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
    });

    responseBodies.push(await response.json());
  }

  return responseBodies;
}

async function main() {
  const userIds: string[] = JSON.parse(
    await readFile("data-01-follower-ids.json", "utf-8")
  );

  const responseBodies = await getProfiles(userIds);

  await writeFile(
    "data-02-get-profiles.json",
    JSON.stringify(responseBodies, null, 2)
  );
}

main().catch((err) => console.error(err));
