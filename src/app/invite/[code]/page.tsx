import { AppFooter } from "@/components/AppFooter";
import { CopyButton } from "@/components/CopyButton";
import { TransitionLink } from "@/components/TransitionLink";
import { createClient } from "@/lib/supabase/server";

function normalizeToken(value: string) {
  return value.replace(/[^0-9a-f]/gi, "").toLowerCase().slice(0, 32);
}

type InvitePreview = {
  status: "valid" | "expired" | "invalid";
  inviter_handle_name: string | null;
  inviter_member_code: string | null;
  expires_at: string | null;
};

type InvitePageProps = { params: Promise<{ code: string }> };

function formatExpiresAt(input: string | null) {
  if (!input) return "";
  return new Date(input).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { code } = await params;
  const token = normalizeToken(code);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let preview: InvitePreview = { status: "invalid", inviter_handle_name: null, inviter_member_code: null, expires_at: null };

  if (token.length === 32) {
    const { data } = await supabase.rpc("get_invite_preview", { invite_token: token });
    const row = Array.isArray(data) ? data[0] : data;
    if (row?.status) preview = row as InvitePreview;
  }

  const valid = preview.status === "valid";
  const expired = preview.status === "expired";

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-10">
      <section className="grid flex-1 items-center">
        <div className="rounded-[2.2rem] border border-white/70 bg-white/85 p-6 shadow-2xl shadow-emerald-100 backdrop-blur-xl">
          <p className="text-sm font-black text-emerald-800">Invitation</p>
          <h1 className="mt-2 text-4xl font-black leading-tight tracking-tight sm:text-5xl">NoriDropに招待されています</h1>

          {valid ? (
            <>
              <p className="mt-4 max-w-2xl leading-8 text-stone-700">
                NoriDropは、友達の「今どんなノリ？」がわかるアプリです。チャットやDMはなく、話しかけるきっかけだけをつくります。
                この招待リンクから登録すると、{preview.inviter_handle_name ?? "招待した友達"}さんと自動で友達になります。
              </p>
              <div className="mt-6 rounded-[1.7rem] bg-stone-950 p-5 text-white">
                <p className="text-sm text-stone-300">24時間有効の招待リンク</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <p className="font-mono text-lg font-black tracking-widest">{token}</p>
                  <CopyButton value={token} />
                </div>
                <p className="mt-3 text-xs text-stone-400">有効期限: {formatExpiresAt(preview.expires_at)}</p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {user ? (
                  <TransitionLink href={`/onboarding?invite=${token}`} className="rounded-2xl bg-gradient-to-r from-[#063f2e] via-[#0b6b47] to-[#12915f] px-5 py-4 text-center font-black text-white shadow-lg shadow-emerald-100">プロフィール作成へ</TransitionLink>
                ) : (
                  <TransitionLink href={`/login?invite=${token}`} className="rounded-2xl bg-gradient-to-r from-[#063f2e] via-[#0b6b47] to-[#12915f] px-5 py-4 text-center font-black text-white shadow-lg shadow-emerald-100">登録・ログインする</TransitionLink>
                )}
                <TransitionLink href="/" className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-center font-black text-stone-800 shadow-sm">トップを見る</TransitionLink>
              </div>
              <p className="mt-5 text-xs leading-6 text-stone-500">登録完了後、招待者と自動で友達になります。期限切れ後は通常登録になります。</p>
            </>
          ) : (
            <>
              <p className="mt-4 max-w-2xl leading-8 text-stone-700">
                {expired ? "この招待リンクは24時間の有効期限を過ぎています。" : "この招待リンクは無効です。"}
                通常の登録はそのまま利用できます。
              </p>
              <div className="mt-6 rounded-[1.7rem] border border-emerald-100 bg-emerald-50/80 p-5">
                <p className="font-black text-emerald-900">通常登録に進む</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">期限切れの場合、自動友達登録と招待実績の記録は行われません。</p>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <TransitionLink href="/login" className="rounded-2xl bg-gradient-to-r from-[#063f2e] via-[#0b6b47] to-[#12915f] px-5 py-4 text-center font-black text-white shadow-lg shadow-emerald-100">登録・ログインする</TransitionLink>
                <TransitionLink href="/" className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-center font-black text-stone-800 shadow-sm">トップを見る</TransitionLink>
              </div>
            </>
          )}
        </div>
      </section>
      <AppFooter />
    </main>
  );
}
