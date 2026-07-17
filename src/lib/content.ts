import { createClient } from "@/lib/supabase/client";

/**
 * Fetch a page's CMS content by slug and merge it over a set of defaults.
 * Missing keys fall back to the defaults, so pages never break before the
 * admin has filled everything in, and partial edits don't wipe out fields
 * the admin hasn't touched yet.
 */
export async function fetchPageContent<T extends Record<string, unknown>>(
  slug: string,
  defaults: T
): Promise<T> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("page_content")
      .select("content")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data?.content) return defaults;
    return { ...defaults, ...(data.content as Partial<T>) };
  } catch {
    return defaults;
  }
}

/**
 * Fetch all site_settings rows into a flat key -> value map, merged over
 * a set of defaults so callers always get every expected key back.
 */
export async function fetchSiteSettings<T extends Record<string, unknown>>(
  defaults: T
): Promise<T> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from("site_settings").select("key, value");

    if (error || !data) return defaults;

    const merged: Record<string, unknown> = { ...defaults };
    for (const row of data) {
      merged[row.key] = row.value;
    }
    return merged as T;
  } catch {
    return defaults;
  }
}

/** Upsert a single page's content JSON. */
export async function savePageContent(slug: string, content: Record<string, unknown>) {
  const supabase = createClient();
  return supabase.from("page_content").upsert({ slug, content }, { onConflict: "slug" });
}

/** Upsert a single site_settings key/value pair. */
export async function saveSiteSetting(key: string, value: unknown) {
  const supabase = createClient();
  return supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
}
