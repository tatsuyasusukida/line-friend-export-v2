import { createHash } from "crypto";
import { readFile, writeFile } from "fs/promises";
import fetch from "node-fetch";

type InputChat = {
  profile: {
    name?: string;
    nickname?: string;
    iconHash?: string;
  };
};

type OutputChat = {
  profile: InputChat["profile"] & {
    imageHash?: string;
  };
};

async function main() {
  const inputChats: InputChat[] = JSON.parse(
    await readFile("data-03-get-chats.json", "utf-8")
  );

  const outputChats: OutputChat[] = [];

  for (const inputChat of inputChats) {
    if (!inputChat.profile.iconHash) {
      outputChats.push(inputChat);
      continue;
    }

    const url = "https://profile.line-scdn.net/" + inputChat.profile.iconHash;
    const response = await fetch(url);
    const buffer = await response.buffer();
    const imageHash = createHash("sha256").update(buffer).digest("base64");

    outputChats.push({
      ...inputChat,
      profile: {
        ...inputChat.profile,
        imageHash,
      },
    });
  }

  await writeFile(
    "data-05-append-chat-hashes.json",
    JSON.stringify(outputChats, null, 2)
  );
}

main().catch((err) => console.error(err));
