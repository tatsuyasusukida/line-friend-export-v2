import { readFile, writeFile } from "fs/promises";
import fetch from "node-fetch";

type ResponseBody = {
  displayName: string;
  userId: string;
  language?: string;
  pictureUrl?: string;
  statusMessage: string;
};

async function main() {
  const userIds: string[] = JSON.parse(
    await readFile("data-01-follower-ids.json", "utf-8")
  );

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

  await writeFile(
    "data-02-get-profiles.json",
    JSON.stringify(responseBodies, null, 2)
  );
}

main().catch((err) => console.error(err));
