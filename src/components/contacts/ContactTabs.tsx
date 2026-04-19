export type ContactTab = "ALL" | "PERSON" | "COMPANY";

interface ContactTabsProps {
  activeTab: ContactTab;
  counts: {
    all: number;
    people: number;
    companies: number;
  };
  onTabChange: (tab: ContactTab) => void;
}

const tabs: Array<{ id: ContactTab; label: string; countKey: "all" | "people" | "companies" }> = [
  { id: "ALL", label: "All", countKey: "all" },
  { id: "PERSON", label: "People", countKey: "people" },
  { id: "COMPANY", label: "Companies", countKey: "companies" },
];

export const ContactTabs = ({ activeTab, counts, onTabChange }: ContactTabsProps) => {
  return (
    <div className="flex items-end gap-5 border-b border-slate-200">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`border-b-2 px-2 pb-2 text-sm font-medium transition ${
              isActive
                ? "border-[#8B6FD0] text-[#8B6FD0]"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label} ({counts[tab.countKey]})
          </button>
        );
      })}
    </div>
  );
};
