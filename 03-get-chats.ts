import { writeFile } from "fs/promises";
import fetch from "node-fetch";

/**
 * チャットページからトークできる友だちのリストを取得する API レスポンスのデータ型です。
 * 2023 年 8 月時点では LINE Developers にドキュメントが無い様子です。
 * https://developers.line.biz/ja/docs/
 */
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

/**
 * LINE 公式アカウント管理画面のチャットページからトークできる友だちのリストを出力します。
 */
async function getChats(): Promise<ResponseBody["list"]> {
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
      process.exit(1);
    }

    const responseBody = await response.json<ResponseBody>();

    if (!responseBody.next) {
      break;
    }

    responseBodies = responseBodies.concat(responseBody.list);
    next = responseBody.next;
  }

  return responseBodies;
}

async function main() {
  const responseBodies = await getChats();

  await writeFile(
    "data-03-get-chats.json",
    JSON.stringify(responseBodies, null, 2)
  );
}

main().catch((err) => console.error(err));
