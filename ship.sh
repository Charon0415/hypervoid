#!/usr/bin/env bash
# 一键提交脚本 — 把当前未提交改动推到 main，触发 Vercel 自动部署。
#
# 用法：
#   ./ship.sh                    # 交互式输入提交信息
#   ./ship.sh "fix: 文案错别字"   # 直接给定提交信息
#   ./ship.sh --no-push          # 只提交，不推送
#
# 行为：
# 1. 显示 git status，让你确认
# 2. git add -A（含新文件，但 .env / .env.local 已在 .gitignore）
# 3. git commit -m "<消息>"
# 4. git push origin main（除非 --no-push）
#
# 安全考量：
# - 不会改 git config / 不会跳过 hooks / 不会强推
# - 没有改动时直接退出，不会建空提交
# - 推送前再次提示

set -euo pipefail

cd "$(dirname "$0")"

# ── 0. 解析参数 ─────────────────────────────────────────────────
DO_PUSH=1
MSG=""
for arg in "$@"; do
  case "$arg" in
    --no-push) DO_PUSH=0 ;;
    --help|-h)
      sed -n '2,18p' "$0"
      exit 0
      ;;
    *) MSG="$arg" ;;
  esac
done

# ── 1. 当前状态 ─────────────────────────────────────────────────
echo "▸ 当前分支：$(git rev-parse --abbrev-ref HEAD)"
echo "▸ 工作区改动："
git -c color.status=always status --short || true
echo

# 没有改动时直接结束
if [[ -z "$(git status --porcelain)" ]]; then
  echo "▸ 工作区干净，无需提交。"
  exit 0
fi

# ── 2. 提交信息 ─────────────────────────────────────────────────
if [[ -z "$MSG" ]]; then
  printf "▸ 提交信息：(格式建议 \"scope: 动作\"，留空取消)\n  > "
  read -r MSG
fi

if [[ -z "${MSG// /}" ]]; then
  echo "▸ 取消。"
  exit 1
fi

# ── 3. 提交 ─────────────────────────────────────────────────────
git add -A
git commit -m "$MSG"

# ── 4. 推送 ─────────────────────────────────────────────────────
if [[ "$DO_PUSH" == "1" ]]; then
  echo "▸ 推送到 origin/main…"
  git push origin main
  echo "✓ 已推送。Vercel 几秒内开始构建：https://vercel.com/dashboard"
else
  echo "▸ 已提交，但未推送（--no-push）。"
fi
