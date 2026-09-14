import { ChevronDown, TrendingDown, TrendingUp, X } from 'lucide-react';
import Gauge from './Gauge';

const ORANGE = '#ef4d23';

function TogglePill({ active, inactive }: { active: string; inactive: string }) {
  return (
    <div className="bg-neutral-100 rounded-full p-1 flex" style={{ fontSize: 12 }}>
      <span className="flex-1 text-center bg-white rounded-full shadow px-3 py-1.5 font-medium text-neutral-900">
        {active}
      </span>
      <span className="flex-1 text-center px-3 py-1.5 text-neutral-500">{inactive}</span>
    </div>
  );
}

function LabeledDropdown({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 text-left">
      <label className="text-neutral-700" style={{ fontSize: 12 }}>
        {label}
      </label>
      <button className="flex items-center justify-between border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 bg-white" style={{ fontSize: 13 }}>
        {value}
        <ChevronDown className="w-4 h-4 text-neutral-500" />
      </button>
    </div>
  );
}

function LabeledInput({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 text-left">
      <label className="text-neutral-700" style={{ fontSize: 12 }}>
        {label}
      </label>
      <div className="flex items-center gap-2 border border-neutral-200 rounded-lg px-3 py-2 bg-white" style={{ fontSize: 13 }}>
        <span className="text-neutral-400">#</span>
        <span className="text-neutral-900">{value}</span>
      </div>
    </div>
  );
}

export default function DashboardPreview() {
  return (
    <div className="px-3 sm:px-4">
      <div className="bg-[#f5f2ee] rounded-3xl p-4 sm:p-6 w-full max-w-[880px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1 — Notes */}
          <div className="bg-white rounded-2xl p-5 text-left">
            <div className="flex items-center justify-between" style={{ fontSize: 13 }}>
              <span className="font-medium" style={{ color: ORANGE }}>
                Notes
              </span>
              <span className="text-neutral-500">This Month</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span style={{ fontSize: 28, fontWeight: 600 }}>6,896</span>
              <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 rounded-full px-2 py-0.5" style={{ fontSize: 11 }}>
                <TrendingDown className="w-3 h-3" />
                -3,382 (33%)
              </span>
            </div>
            <p className="text-neutral-500" style={{ fontSize: 11 }}>
              Compared to yesterday
            </p>
            <p className="mt-3 text-center text-neutral-700" style={{ fontSize: 12 }}>
              Month Target achieved
            </p>
            <Gauge value={92} color={ORANGE} showLabels min="389K" max="425K" />
            <div className="mt-3">
              <TogglePill active="Transcripts" inactive="Notes" />
            </div>
          </div>

          {/* Card 2 — Form */}
          <div className="bg-white rounded-2xl p-5 flex flex-col gap-3">
            <LabeledDropdown label="Show figures for" value="This month" />
            <LabeledDropdown label="Compare period by" value="Month-to-date (MTD)" />
            <LabeledInput label="Note targets (This month)" value="10" />
            <LabeledInput label="Note targets (This year)" value="100" />
            <div className="mt-auto flex items-center gap-4 pt-1">
              <button
                className="text-white rounded-lg px-5 py-2 font-medium"
                style={{ backgroundColor: ORANGE, fontSize: 13 }}
              >
                Save
              </button>
              <button className="underline text-neutral-700" style={{ fontSize: 13 }}>
                Cancel
              </button>
              <X className="w-4 h-4 text-neutral-400 ml-auto" />
            </div>
          </div>

          {/* Card 3 — Voice Minutes */}
          <div className="bg-white rounded-2xl p-5 text-left">
            <div className="flex items-center justify-between" style={{ fontSize: 13 }}>
              <span className="font-medium" style={{ color: ORANGE }}>
                Voice Minutes
              </span>
              <span className="text-neutral-500">today</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span style={{ fontSize: 28, fontWeight: 600 }}>0</span>
              <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-600 rounded-full px-2 py-0.5" style={{ fontSize: 11 }}>
                <TrendingUp className="w-3 h-3" />
                0
              </span>
            </div>
            <p className="text-neutral-500" style={{ fontSize: 11 }}>
              Compared to yesterday
            </p>
            <div className="mt-6">
              <Gauge value={68} color="#9ca3af" />
            </div>
            <div className="mt-3">
              <TogglePill active="Recordings" inactive="Voice Minutes" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
