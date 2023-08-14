import { createHash } from "crypto";
import { readFile, writeFile } from "fs/promises";
import fetch from "node-fetch";

/**
 * 入力されるプロフィールのデータ型です。
 * 04-append-profile-hashes.ts の出力データ型と同じです。
 */
type InputProfile = {
  displayName: string;
  userId: string;
  language?: string;
  pictureUrl?: string;
  statusMessage: string;
  imageHash?: string;
};

/**
 * 入力されるチャット情報のデータ型です。
 * 05-append-chat-hashes.ts の出力データ型と同じです。
 */
type InputChat = {
  profile: {
    name?: string;
    nickname?: string;
    iconHash?: string;
    imageHash?: string;
  };
};

/**
 * 出力されるプロフィールのデータ型です。
 */
type OutputProfile = InputProfile & {
  nickname?: string;
};

/**
 * プロフィールとチャット情報を名寄せし、プロフィールにニックネームを付加します。
 * ニックネームとはチャットページで店舗が顧客に設定した名前のことです。
 * 次の 2 つの条件の両方を満たした場合に同一の顧客と判断しています。
 *
 * - プロフィールの表示名とチャット情報の表示名が同じであること
 * - プロフィールの画像ハッシュ値とチャット情報の画像ハッシュ値が同じであること
 */
function join(
  inputProfiles: InputProfile[],
  inputChats: InputChat[]
): OutputProfile[] {
  const outputProfiles: OutputProfile[] = inputProfiles.map((inputProfile) => {
    if (!inputProfile.imageHash) {
      return inputProfile;
    }

    const chats = inputChats.filter((chat) => {
      return (
        chat.profile.name === inputProfile.displayName &&
        chat.profile.imageHash &&
        chat.profile.imageHash === inputProfile.imageHash
      );
    });

    if (chats.length !== 1) {
      return inputProfile;
    }

    return {
      ...inputProfile,
      nickname: chats[0].profile.nickname,
    };
  });

  return outputProfiles;
}

async function main() {
  const inputProfiles: InputProfile[] = JSON.parse(
    await readFile("data-04-append-profile-hashes.json", "utf-8")
  );

  const inputChats: InputChat[] = JSON.parse(
    await readFile("data-05-append-chat-hashes.json", "utf-8")
  );

  const outputProfiles = await join(inputProfiles, inputChats);

  await writeFile("data-06-join.json", JSON.stringify(outputProfiles, null, 2));
}

main().catch((err) => console.error(err));
