#!/usr/bin/env bash
set -euo pipefail

USER="MariaCnightmare"
OUT_DIR="data"
OUT_FILE="${OUT_DIR}/repos.json"

mkdir -p "${OUT_DIR}"

TMP_BODY="$(mktemp)"
TMP_HDR="$(mktemp)"
cleanup() { rm -f "${TMP_BODY}" "${TMP_HDR}"; }
trap cleanup EXIT

AUTH_HEADER=()
if [ -n "${GITHUB_TOKEN:-}" ]; then
  AUTH_HEADER=(-H "Authorization: Bearer ${GITHUB_TOKEN}")
fi

API_URL="https://api.github.com/users/${USER}/repos?per_page=100&sort=updated"

# GitHub API は User-Agent を要求するケースがあるので明示
# 失敗時に body を必ず残し、HTTPコードも取得する
HTTP_CODE="$(
  curl -sS \
    -H "Accept: application/vnd.github+json" \
    -H "User-Agent: MariaCnightmare-github-pages-catalog" \
    "${AUTH_HEADER[@]}" \
    -D "${TMP_HDR}" \
    -o "${TMP_BODY}" \
    -w "%{http_code}" \
    "${API_URL}"
)"

if [ "${HTTP_CODE}" != "200" ]; then
  echo "ERROR: GitHub API returned HTTP ${HTTP_CODE}" >&2
  echo "--- Response headers ---" >&2
  sed -n '1,120p' "${TMP_HDR}" >&2
  echo "--- Response body (first 400 chars) ---" >&2
  python3 - <<'PY' "${TMP_BODY}" >&2
import sys
p=sys.argv[1]
b=open(p,'rb').read()
print(b[:400].decode('utf-8','replace'))
PY
  exit 1
fi

# bodyが空でないか念のため確認
if [ ! -s "${TMP_BODY}" ]; then
  echo "ERROR: GitHub API response body is empty." >&2
  exit 1
fi

python3 - "${TMP_BODY}" > "${OUT_FILE}" <<'PY'
import json, sys

path = sys.argv[1]
with open(path, "r", encoding="utf-8") as f:
    repos = json.load(f)

items = []
for r in repos:
    if r.get("fork"):
        continue
    if r.get("archived"):
        continue
    items.append({
        "name": r["name"],
        "html_url": r["html_url"],
        "homepage": r.get("homepage") or "",
        "description": (r.get("description") or "").strip(),
        "stargazers_count": r.get("stargazers_count", 0),
        "language": r.get("language") or "",
        "updated_at": r.get("updated_at") or "",
        "topics": r.get("topics") or [],
    })

print(json.dumps({"items": items}, ensure_ascii=False, indent=2))
PY

echo "Wrote ${OUT_FILE}"
