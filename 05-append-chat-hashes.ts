import { createHash } from "crypto";
import { readFile, writeFile } from "fs/promises";
import fetch from "node-fetch";

/**
 * 入力されるチャット情報のデータ型です。
 * 03-get-chats.ts の出力データ型と同じです。
 */
type InputChat = {
  profile: {
    name?: string;
    nickname?: string;
    iconHash?: string;
  };
};

/**
 * 出力されるチャット情報のデータ型です。
 */
type OutputChat = {
  profile: InputChat["profile"] & {
    /** プロフィール画像の SHA-256 ハッシュ値です。 */
    imageHash?: string;
  };
};

/**
 * チャット情報のリストを入力するとプロフィール画像の SHA-256 ハッシュ値を付加して出力します。
 */
async function appendChatHashes(
  inputChats: InputChat[]
): Promise<OutputChat[]> {
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

  return outputChats;
}

async function main() {
  const inputChats: InputChat[] = JSON.parse(
    await readFile("data-03-get-chats.json", "utf-8")
  );

  const outputChats = await appendChatHashes(inputChats);

  await writeFile(
    "data-05-append-chat-hashes.json",
    JSON.stringify(outputChats, null, 2)
  );
}

main().catch((err) => console.error(err));
