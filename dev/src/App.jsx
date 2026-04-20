import { useState } from "react";
import AdminShell from "@/pages/admin/AdminShell";
import Placeholder from "@/pages/admin/Placeholder";
import CampaignsPage from "@/pages/admin/CampaignsPage";
import RefIndex from "@/pages/admin/refs/RefIndex";
import RefEditsPage from "@/pages/admin/RefEditsPage";
import PlayersPage from "@/pages/admin/PlayersPage";
import SoundIndex from "@/pages/admin/sounds/SoundIndex";
import ToastHost from "@/components/Toast";

export default function App() {
  const [section, setSection] = useState("campaigns");
  const [activeCampaign, setActiveCampaign] = useState(null);

  const render = () => {
    switch (section) {
      case "campaigns":
        return <CampaignsPage activeCampaign={activeCampaign} onSelect={setActiveCampaign} />;
      case "characters":
        return activeCampaign
          ? <Placeholder title="Characters" description="Campaign-scoped. Coming next." />
          : <Placeholder title="Characters" description="Select a campaign first." />;
      case "content":
        return activeCampaign
          ? <Placeholder title="Lore & Journal" description="Campaign-scoped. Coming next." />
          : <Placeholder title="Lore & Journal" description="Select a campaign first." />;
      case "refs":
        return <RefIndex activeCampaign={activeCampaign} />;
      case "sounds":
        return <SoundIndex />;
      case "ref-edits":
        return <RefEditsPage />;
      case "players":
        return <PlayersPage activeCampaign={activeCampaign} />;
      default:
        return <Placeholder title="Unknown section" />;
    }
  };

  return (
    <>
      <AdminShell
        section={section}
        onSection={setSection}
        campaignName={activeCampaign?.name}
        campaignSelected={!!activeCampaign}
      >
        {render()}
      </AdminShell>
      <ToastHost />
    </>
  );
}
