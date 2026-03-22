import type { Metadata } from "next";

// PERMISSION: Only ADMIN can access workspace settings

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage workspace configuration, stages, and team access
        </p>
      </div>

      {/* Settings sections */}
      {[
        {
          title: "Workspace",
          items: ["Company name", "Logo", "Timezone"],
        },
        {
          title: "Stage Templates",
          items: ["Manage default renovation stages", "Set sort order", "Enable/disable per workspace"],
        },
        {
          title: "Team & Access",
          items: ["Invite team members", "Assign roles", "Remove users"],
        },
        {
          title: "Integrations",
          items: ["UploadThing (file uploads)", "Google OAuth", "Notification webhooks"],
        },
        {
          title: "Data",
          items: ["Export all data (CSV/JSON)", "Audit log", "Archive buildings"],
        },
      ].map((section) => (
        <div key={section.title} className="bg-card rounded-lg border p-5">
          <h3 className="font-medium mb-3">{section.title}</h3>
          <ul className="space-y-2">
            {section.items.map((item) => (
              <li key={item} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <span className="text-sm text-muted-foreground">{item}</span>
                <span className="text-xs text-muted-foreground/50 bg-muted px-2 py-0.5 rounded">
                  Configure
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
