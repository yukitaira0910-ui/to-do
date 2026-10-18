# Flow

モバイルファーストの、即時メモとフリック操作に集中したタスク管理アプリです。

## 技術選定

- **HTML / CSS / Vanilla JavaScript**: 起動時にメモ欄へ到達するまでの経路を最短化し、依存関係・JavaScript 転送量をゼロに保つため。
- **Cloudflare Workers + Static Assets**: エッジで静的 UI と API を同一デプロイし、低遅延・運用不要の構成にするため。
- **Workers AI**: `/api/ai/organize` でメモをタイトル・分類へ整理する AI 拡張点を、外部 AI API の鍵をクライアントに出さず実現するため。
- **Google OAuth 2.0 + D1**: Google のみをログイン選択肢にし、OAuth の state 検証と HTTP-only セッション Cookie を Workers で完結させるため。D1 には短期セッションのみを保存し、Google トークンは保存しません。
- **localStorage**: 認証前でも入力直後から端末に保存し、瞬時に使えるようにするため。認証後は D1 への同期へ差し替えます。

## ローカル確認

`node --test tests/app.test.mjs` を実行します。静的ファイルは任意のローカル HTTP サーバーで配信してください。

## Cloudflare 公開

1. `wrangler d1 create flow` を実行し、出力された ID で `wrangler.toml` の `database_id` を置換します。
2. `wrangler d1 execute flow --remote --file=migrations/0001_sessions.sql` を実行します。
3. Google Cloud に `https://<worker-domain>/api/auth/callback` をリダイレクト URI として登録します。
4. `wrangler secret put GOOGLE_CLIENT_ID` と `wrangler secret put GOOGLE_CLIENT_SECRET` を実行します。
5. `wrangler deploy` を実行します。
