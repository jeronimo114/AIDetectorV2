import { updateSetting } from "@/app/admin/settings/actions";
import { adminGetSettings } from "@/lib/admin/settings";

export default async function AdminSettingsPage() {
  const settings = await adminGetSettings();
  const settingsMap = new Map(settings.map((item) => [item.key, item.value]));

  async function handleSave(formData: FormData) {
    "use server";
    const key = String(formData.get("key"));
    const rawValue = formData.get("value");
    let parsedValue: unknown = rawValue;

    if (rawValue === "true" || rawValue === "false") {
      parsedValue = rawValue === "true";
    } else if (rawValue && !Number.isNaN(Number(rawValue))) {
      parsedValue = Number(rawValue);
    }

    await updateSetting(key, parsedValue);
  }

  const getValue = (key: string) => settingsMap.get(key) ?? "";

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">Settings</p>
        <h1 className="mt-3 text-3xl font-semibold text-[#1f1d18]">App settings</h1>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        {[
          { key: "n8n_webhook_url", label: "Webhook URL" },
          { key: "n8n_backup_url", label: "Backup URL" },
          { key: "analysis_timeout_seconds", label: "Timeout (seconds)" },
          { key: "analysis_retry_count", label: "Retry count" },
          { key: "daily_run_limit", label: "Daily run limit" }
        ].map((setting) => (
          <form
            key={setting.key}
            action={handleSave}
            className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur"
          >
            <input type="hidden" name="key" value={setting.key} />
            <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">{setting.label}</p>
            <input
              name="value"
              defaultValue={getValue(setting.key) as string}
              className="mt-3 w-full rounded-2xl border border-[#d6d2c6] bg-white p-3 text-sm text-[#1f1d18]"
            />
            <button
              type="submit"
              className="mt-4 rounded-full bg-[#1f2a1f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f6f5ef]"
            >
              Save
            </button>
          </form>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {[
          { key: "maintenance_mode", label: "Maintenance mode" },
          { key: "enable_tips", label: "Enable tips" },
          { key: "enable_rerun", label: "Enable rerun" }
        ].map((setting) => (
          <form
            key={setting.key}
            action={handleSave}
            className="rounded-3xl border border-[#d6d2c6] bg-white/80 p-6 shadow-[0_18px_60px_rgba(27,24,19,0.08)] backdrop-blur"
          >
            <input type="hidden" name="key" value={setting.key} />
            <p className="text-xs uppercase tracking-[0.3em] text-[#7b756a]">{setting.label}</p>
            <select
              name="value"
              defaultValue={String(getValue(setting.key) ?? false)}
              className="mt-3 w-full rounded-2xl border border-[#d6d2c6] bg-white p-3 text-sm text-[#1f1d18]"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
            <button
              type="submit"
              className="mt-4 rounded-full bg-[#1f2a1f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f6f5ef]"
            >
              Save
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
