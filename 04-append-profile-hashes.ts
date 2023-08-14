import { createHash } from "crypto";
import { readFile, writeFile } from "fs/promises";
import fetch from "node-fetch";

/**
 * 入力されるプロフィールのデータ型です。
 * 02-get-profiles.ts の出力データ型と同じです。
 */
type InputProfile = {
  displayName: string;
  userId: string;
  language?: string;
  pictureUrl?: string;
  statusMessage: string;
};

/**
 * 出力されるプロフィールのデータ型です。
 */
type OutputProfile = InputProfile & {
  /** プロフィール画像の SHA-256 ハッシュ値です。 */
  imageHash?: string;
};

/**
 * プロフィールのリストを入力するとプロフィール画像の SHA-256 ハッシュ値を付加して出力します。
 */
async function appendProfileHashes(
  inputProfiles: InputProfile[]
): Promise<OutputProfile[]> {
  const outputProfiles: OutputProfile[] = [];

  for (const inputProfile of inputProfiles) {
    if (!inputProfile.pictureUrl) {
      outputProfiles.push(inputProfile);
      continue;
    }

    const response = await fetch(inputProfile.pictureUrl);
    const buffer = await response.buffer();
    const imageHash = createHash("sha256").update(buffer).digest("base64");

    outputProfiles.push({
      ...inputProfile,
      imageHash,
    });
  }

  return outputProfiles;
}

async function main() {
  const inputProfiles: InputProfile[] = JSON.parse(
    await readFile("data-02-get-profiles.json", "utf-8")
  );

  const outputProfiles = await appendProfileHashes(inputProfiles);

  await writeFile(
    "data-04-append-profile-hashes.json",
    JSON.stringify(outputProfiles, null, 2)
  );
}

main().catch((err) => console.error(err));
