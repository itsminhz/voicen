import { ChevronDown, TrendingUp, X } from 'lucide-react';
import Gauge from './Gauge';

const SKY = '#0ea5e9';

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
          {/* Card 1 — Notes created */}
          <div className="bg-white rounded-2xl p-5 text-left">
            <div className="flex items-center justify-between" style={{ fontSize: 13 }}>
              <span className="font-medium" style={{ color: SKY }}>
                Notes created
              </span>
              <span className="text-neutral-500">This month</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span style={{ fontSize: 28, fontWeight: 600 }}>128</span>
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 rounded-full px-2 py-0.5" style={{ fontSize: 11 }}>
                <TrendingUp className="w-3 h-3" />
                +32 (33%)
              </span>
            </div>
            <p className="text-neutral-500" style={{ fontSize: 11 }}>
              Compared to last month
            </p>
            <p className="mt-3 text-center text-neutral-700" style={{ fontSize: 12 }}>
              Monthly note goal
            </p>
            <Gauge value={92} color={SKY} showLabels min="128" max="140" />
            <div className="mt-3">
              <TogglePill active="Study notes" inactive="Meetings" />
            </div>
          </div>

          {/* Card 2 — Form */}
          <div className="bg-white rounded-2xl p-5 flex flex-col gap-3">
            <LabeledDropdown label="Show figures for" value="This month" />
            <LabeledDropdown label="Default note mode" value="Student — study notes" />
            <LabeledInput label="Note goal (This month)" value="140" />
            <LabeledInput label="Recording goal (This week)" value="12" />
            <div className="mt-auto flex items-center gap-4 pt-1">
              <button
                className="text-white rounded-lg px-5 py-2 font-medium"
                style={{ backgroundColor: SKY, fontSize: 13 }}
              >
                Save
              </button>
              <button className="underline text-neutral-700" style={{ fontSize: 13 }}>
                Cancel
              </button>
              <X className="w-4 h-4 text-neutral-400 ml-auto" />
            </div>
          </div>

          {/* Card 3 — Voice minutes */}
          <div className="bg-white rounded-2xl p-5 text-left">
            <div className="flex items-center justify-between" style={{ fontSize: 13 }}>
              <span className="font-medium" style={{ color: SKY }}>
                Voice minutes
              </span>
              <span className="text-neutral-500">Today</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span style={{ fontSize: 28, fontWeight: 600 }}>47</span>
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 rounded-full px-2 py-0.5" style={{ fontSize: 11 }}>
                <TrendingUp className="w-3 h-3" />
                +12 (34%)
              </span>
            </div>
            <p className="text-neutral-500" style={{ fontSize: 11 }}>
              Compared to yesterday
            </p>
            <p className="mt-3 text-center text-neutral-700" style={{ fontSize: 12 }}>
              Action items completed
            </p>
            <Gauge value={68} color="#9ca3af" showLabels min="17" max="25" />
            <div className="mt-3">
              <TogglePill active="Recordings" inactive="Sticky lists" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
