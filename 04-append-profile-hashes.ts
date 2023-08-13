import { createHash } from "crypto";
import { readFile, writeFile } from "fs/promises";
import fetch from "node-fetch";

type InputProfile = {
  displayName: string;
  userId: string;
  language?: string;
  pictureUrl?: string;
  statusMessage: string;
};

type OutputProfile = InputProfile & {
  imageHash?: string;
};

async function main() {
  const inputProfiles: InputProfile[] = JSON.parse(
    await readFile("data-02-get-profiles.json", "utf-8")
  );

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

  await writeFile(
    "data-04-append-profile-hashes.json",
    JSON.stringify(outputProfiles, null, 2)
  );
}

main().catch((err) => console.error(err));
