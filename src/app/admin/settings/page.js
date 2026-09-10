import { Settings02Icon } from "@hugeicons/core-free-icons";
import PageLayout from "@/components/admin/page-layout";
import PageHeader from "@/components/admin/page-header";
import SettingsForm from "@/components/admin/settings-form";
import { getSettings } from "@/lib/api/settings";
import { title } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = {
  title: title("Site settings"),
  robots: { index: false, follow: false },
};

const SettingsPage = async () => {
  const settings = await getSettings();

  return (
    <PageLayout>
      <PageHeader
        title="Site settings"
        description="Address, contact details, social links and the marquee — everything the storefront footer reads."
        icon={Settings02Icon}
      />

      <SettingsForm settings={settings} />
    </PageLayout>
  );
};

export default SettingsPage;
