"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { Avatar } from "@/components/Avatar";
import { startGlobalLoading } from "@/components/LoadingOverlay";

type AvatarUploaderProps = {
  name: string;
  currentUrl?: string | null;
  handleName: string;
};

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export function AvatarUploader({ name, currentUrl, handleName }: AvatarUploaderProps) {
  const [url, setUrl] = useState(currentUrl ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setMessage("png / jpg / webp / gif の画像を選んでください。");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setMessage("画像は2MB以下にしてください。");
      return;
    }

    setUploading(true);
    setMessage(null);
    startGlobalLoading();

    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setMessage("ログイン情報を確認できませんでした。");
      setUploading(false);
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "png";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const path = `${user.id}/${safeName}`;

    const { error } = await supabase.storage.from("avatars").upload(path, file, { cacheControl: "3600", upsert: true });
    if (error) {
      setMessage(`アップロードに失敗しました: ${error.message}`);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setUrl(data.publicUrl);
    setMessage("アップロードしました。最後に保存ボタンを押してください。");
    setUploading(false);
  }

  return (
    <div className="rounded-3xl border border-emerald-100 bg-white/70 p-4">
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-4">
        <Avatar src={url} name={handleName || "user"} size="lg" />
        <div className="flex-1">
          <label className="inline-flex cursor-pointer rounded-2xl bg-stone-950 px-4 py-3 text-sm font-bold text-white hover:bg-stone-800">
            <span className="inline-flex items-center gap-2">
              {uploading ? <span className="h-4 w-4 rounded-full border-2 border-white/50 border-t-white noridrop-spinner" /> : null}
              {uploading ? "アップロード中..." : "画像をアップロード"}
            </span>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleChange} disabled={uploading} />
          </label>
          <p className="mt-2 text-xs leading-5 text-stone-500">最大2MB。プロフィール保存で反映されます。</p>
        </div>
      </div>
      {message ? <p className="mt-3 text-sm text-stone-700">{message}</p> : null}
    </div>
  );
}
