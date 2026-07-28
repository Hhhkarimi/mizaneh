# APPLY.md — how to apply `mizaneh-changes.zip`

Both methods below produce the same end state: the repository as it
exists in `mizaneh-final.zip`, applied on top of your own checkout of
`BASE_COMMIT` (`4a2d747d027ce3e85413a12488009d686e6187b1`).

## Method 1 — copy changed files over your project

1. Extract `mizaneh-changes.zip` somewhere temporary.
2. From your project root (a checkout of `BASE_COMMIT`), copy every file
   under the extracted folder **except** `changes.patch`,
   `DELETED_FILES.txt`, `CHANGELOG.md`, `APPLY.md`, `TEST_REPORT.md`, and
   `MANIFEST.sha256` into the matching relative path in your project,
   overwriting where a file already exists:
   ```bash
   rsync -a --exclude 'changes.patch' --exclude 'DELETED_FILES.txt' \
     --exclude 'CHANGELOG.md' --exclude 'APPLY.md' \
     --exclude 'TEST_REPORT.md' --exclude 'MANIFEST.sha256' \
     /path/to/extracted/mizaneh-changes/ /path/to/your/mizaneh/
   ```
3. `DELETED_FILES.txt` lists any files that need to be removed from your
   project — in this pass it's empty (nothing was deleted relative to
   `BASE_COMMIT`).
4. Verify the checksums in `MANIFEST.sha256` if you want to confirm
   nothing was corrupted in transit:
   ```bash
   cd /path/to/extracted/mizaneh-changes
   sha256sum -c MANIFEST.sha256
   ```
5. Install and validate:
   ```bash
   npm ci
   npm run lint
   npm run test
   npm run build
   ```

## Method 2 — apply `changes.patch` with git

1. Make sure your project is a clean checkout of `BASE_COMMIT` with no
   local modifications (`git status` clean).
2. From your project root:
   ```bash
   git apply --check /path/to/extracted/mizaneh-changes/changes.patch
   git apply /path/to/extracted/mizaneh-changes/changes.patch
   ```
   (Use `git am` instead of `git apply` if you'd rather this land as a
   proper commit with the changelog as its message — the patch was
   generated with `git diff --binary --find-renames --find-copies`, so it
   carries binary-file and rename/copy metadata correctly, though this
   pass didn't rename or delete any file.)
3. Install and validate exactly as in Method 1, step 5.

Both methods were verified during this audit by extracting/applying into
a fresh temporary checkout and confirming `npm ci`, `npm run lint`,
`npm run test`, and `npm run build` all pass — see `TEST_REPORT.md`.
