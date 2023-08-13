import { createHash } from "crypto";
import { readFile, writeFile } from "fs/promises";
import fetch from "node-fetch";

type InputProfile = {
  displayName: string;
  userId: string;
  language?: string;
  pictureUrl?: string;
  statusMessage: string;
  imageHash?: string;
};

type InputChat = {
  profile: {
    name?: string;
    nickname?: string;
    iconHash?: string;
    imageHash?: string;
  };
};

type OutputProfile = InputProfile & {
  nickname?: string;
};

async function main() {
  const inputProfiles: InputProfile[] = JSON.parse(
    await readFile("data-04-append-profile-hashes.json", "utf-8")
  );

  const inputChats: InputChat[] = JSON.parse(
    await readFile("data-05-append-chat-hashes.json", "utf-8")
  );

  const outputProfiles: OutputProfile[] = [];

  for (const inputProfile of inputProfiles) {
    if (!inputProfile.imageHash) {
      outputProfiles.push(inputProfile);
      continue;
    }

    const chats = inputChats.filter((chat) => {
      return (
        chat.profile.imageHash &&
        chat.profile.imageHash === inputProfile.imageHash &&
        chat.profile.name === inputProfile.displayName
      );
    });

    if (chats.length === 1) {
      outputProfiles.push({
        ...inputProfile,
        nickname: chats[0].profile.nickname,
      });
    } else {
      outputProfiles.push(inputProfile);
    }
  }

  await writeFile("data-06-join.json", JSON.stringify(outputProfiles, null, 2));
}

main().catch((err) => console.error(err));
