interface ActivityTabsProps {
  activeTab: "todo" | "done";
  onChange: (tab: "todo" | "done") => void;
}

export const ActivityTabs = ({ activeTab, onChange }: ActivityTabsProps) => {
  return (
    <div className="flex items-center gap-5 border-b border-slate-200">
      <button
        type="button"
        onClick={() => onChange("todo")}
        className={`border-b-2 px-1 pb-2 text-sm font-medium transition ${
          activeTab === "todo"
            ? "border-[#8B6FD0] text-slate-900"
            : "border-transparent text-slate-500 hover:text-slate-700"
        }`}
      >
        To Do
      </button>
      <button
        type="button"
        onClick={() => onChange("done")}
        className={`border-b-2 px-1 pb-2 text-sm font-medium transition ${
          activeTab === "done"
            ? "border-[#8B6FD0] text-slate-900"
            : "border-transparent text-slate-500 hover:text-slate-700"
        }`}
      >
        Done
      </button>
    </div>
  );
};
