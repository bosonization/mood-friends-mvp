# NoriDrop production notes

## Free operation

- Keep Vercel Hobby non-commercial. Do not enable ads/affiliate on Vercel Hobby.
- Keep Supabase Free while validating. Free plan should restrict service instead of charging overages.
- Storage upload is limited to 2MB by client and bucket settings.
- Middleware includes a lightweight POST rate limit. It is not a replacement for a real WAF.
- robots.txt disallows crawling during MVP validation.

## Ads / Affiliate

- Keep `NEXT_PUBLIC_ENABLE_ADS=false` until monetization starts.
- When enabling ads, show clear `広告` / `PR` labels.
- Update `/privacy` and `/disclosures` with the actual ad network names and external transmission details.
- For monetization while staying free, evaluate moving hosting away from Vercel Hobby or upgrading to Vercel Pro.

## Legal

- Terms and privacy policy are starter templates, not legal advice.
- Absolute no-liability clauses can be invalid under Japanese consumer law. The terms use "法令上認められる範囲" wording.
- A real launch should add a reachable contact method, even if minimal.
