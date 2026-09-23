/*
 * ============================================================================
 * QUESTWOOD - REFINED BUILD v2.0 (2026-09-23)
 * ----------------------------------------------------------------------------
 * Omni generated the first version of this custom element. It was then
 * refined by hand. Every button writes real data to the Case Tasks table.
 *
 * NOTE FOR OMNI AND ANYONE EDITING THIS FILE
 *   1. Blocks marked "REFINED" hold fixes and safeguards. Keep them.
 *   2. When asked for a change, edit only the part the request is about.
 *      Do not regenerate, reorganize, or rewrite the whole file.
 *   3. Keep QUESTWOOD_VERSION and the version stamp in the footer. If the
 *      stamp disappears from the page, this refined build was overwritten.
 *   4. Status and role choices are matched by choice ID (CHOICE_IDS).
 *      Do not switch them back to typed-in names.
 *   5. Keep the "Your changes" undo list. It removes test data completely,
 *      including Completed At dates this page added.
 * ============================================================================
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  initializeBlock,
  useBase,
  useRecords,
  useCustomProperties,
  CellRenderer,
  expandRecord,
} from '@airtable/blocks/interface/ui';
import { FieldType, Field, Table } from '@airtable/blocks/interface/models';
import {
  MagnifyingGlassIcon,
  TreeIcon,
  FlowerLotusIcon,
  FlowerIcon,
  StarIcon,
  TrophyIcon,
  CaretDownIcon,
  CaretUpIcon,
  HouseIcon,
  LeafIcon,
  SunIcon,
  CloudIcon,
  ButterflyIcon,
  BirdIcon,
  CatIcon,
  PlantIcon,
  SparkleIcon,
  CheckCircleIcon,
  PlayIcon,
  ArrowCounterClockwiseIcon,
  WarningIcon,
  InfoIcon,
  QuestionIcon,
  XIcon,
  EyeIcon,
} from '@phosphor-icons/react';

// ----------------------------------------------------------------------------
// REFINED: version stamp. Shown in the footer so an overwrite is easy to spot.
// ----------------------------------------------------------------------------
const QUESTWOOD_VERSION = 'v2.0 refined (2026-09-23)';

const XP_PER_TASK = 25;
const XP_PER_LEVEL = 100;

// ----------------------------------------------------------------------------
// REFINED: celebration tuning. Adjust timing here, not inside the components.
// ----------------------------------------------------------------------------
const CELEBRATION = {
  holdCardMs: 2500, // how long a finished card stays in place before moving to the bottom
  flyDurationMs: 900, // how long the "+25 XP" tag takes to reach Team XP
  shareBadgeMs: 2500, // how long "+12.5" shows on leaderboard rows
  flowerGrowMs: 1200, // how long the newest flower animates
  toastMs: 8000, // how long a message with an Undo button stays up
};
const MAX_FLOWERS_SHOWN = 48;

// ----------------------------------------------------------------------------
// REFINED: choice IDs from the Demo base (appY3L5TcbLUcie6d).
// A choice keeps its ID when it's renamed, so scoring survives renames.
// The names below are only a fallback if an ID isn't found (for example,
// if this element is pointed at a different base).
// ----------------------------------------------------------------------------
const CHOICE_IDS = {
  status: {
    open: 'selwKhBwpiudQkN00',
    inProgress: 'seliUeIp2r1vBrQeE',
    complete: 'selj5qmnsRtCAQ8C2',
  },
  taskRoleParaprofessional: 'selZK3YkyQx5zszYp', // Case Tasks > Responsible Role
  staffRoleParaprofessional: 'selxx1skp1TtOfKmE', // Staff > Role
};
const CHOICE_NAME_FALLBACKS = {
  open: 'Open',
  inProgress: 'In progress',
  complete: 'Complete',
  paraprofessional: 'Paraprofessional',
};

const DECORATIONS = [
  { level: 1, icon: FlowerLotusIcon, name: 'Daisy Bloom', color: '#FFBA05', xpRequired: 0 },
  { level: 2, icon: LeafIcon, name: 'Clover Patch', color: '#048A0E', xpRequired: 100 },
  { level: 3, icon: PlantIcon, name: 'Fern Grove', color: '#40C464', xpRequired: 200 },
  { level: 4, icon: ButterflyIcon, name: 'Butterfly Friend', color: '#DD04A8', xpRequired: 300 },
  { level: 5, icon: BirdIcon, name: 'Songbird Nest', color: '#39CAFF', xpRequired: 400 },
  { level: 6, icon: TreeIcon, name: 'Oak Sapling', color: '#3B66A3', xpRequired: 500 },
  { level: 7, icon: SunIcon, name: 'Sunstone', color: '#D54401', xpRequired: 600 },
  { level: 8, icon: CatIcon, name: 'Forest Cat', color: '#A2680D', xpRequired: 700 },
  { level: 9, icon: CloudIcon, name: 'Cloud Sprite', color: '#88DBFF', xpRequired: 800 },
  { level: 10, icon: StarIcon, name: 'Starlight Crown', color: '#7C37EF', xpRequired: 900 },
];

const FLOWER_COLORS = ['#FFBA05', '#DD04A8', '#F82B60', '#7C37EF', '#39CAFF', '#FF6F2C'];

// REFINED: animations defined here so they work without extra Tailwind setup.
// Every animation switches off when the viewer's device asks for reduced motion.
const QW_STYLES = `
@keyframes qw-fade-in { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
@keyframes qw-pop { 0% { transform: scale(1); } 40% { transform: scale(1.2); } 100% { transform: scale(1); } }
@keyframes qw-grow { 0% { transform: scale(0) translateY(8px); opacity: 0; } 70% { transform: scale(1.25) translateY(0); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
@keyframes qw-sparkle { 0% { opacity: 0; transform: scale(0.4) rotate(0deg); } 30% { opacity: 1; } 100% { opacity: 0; transform: scale(1.5) rotate(45deg); } }
@keyframes qw-rise { 0% { opacity: 0; transform: translateY(4px); } 15% { opacity: 1; transform: translateY(0); } 85% { opacity: 1; } 100% { opacity: 0; transform: translateY(-6px); } }
.qw-fade-in { animation: qw-fade-in 0.2s ease-out; }
.qw-pop { animation: qw-pop 0.5s ease-out; }
.qw-grow { animation: qw-grow 0.9s ease-out; }
.qw-sparkle { animation: qw-sparkle 1.2s ease-out forwards; }
.qw-rise { animation: qw-rise 2.4s ease-out forwards; }
@media (prefers-reduced-motion: reduce) {
  .qw-fade-in, .qw-pop, .qw-grow, .qw-sparkle, .qw-rise { animation: none !important; }
}
`;

// ----------------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------------
type StatusKey = 'open' | 'inProgress' | 'complete' | 'other';
type Decoration = (typeof DECORATIONS)[number];

interface Choice {
  id: string;
  name: string;
  color?: string;
}

interface ResolvedChoice {
  choice: Choice | null;
  matchedBy: 'id' | 'name' | 'missing';
}

interface Staff {
  id: string;
  name: string;
  role: string;
}

interface TaskRecord {
  id: string;
  name: string;
  statusKey: StatusKey;
  statusId: string | null;
  statusName: string;
  internalDueAt: string | null;
  timingAlert: string;
  notes: string;
  assignedStaffIds: string[];
  done: boolean;
  completedAt: string | null;
  record: any;
}

interface PlayerScore {
  id: string;
  name: string;
  xp: number;
  completedTasks: number;
  level: number;
  rank: number;
}

// REFINED: what a task looked like before and after a change made on this page.
interface TaskSnapshot {
  statusId: string | null;
  done: boolean;
  completedAt: string | null;
}

interface ChangeLogEntry {
  taskId: string;
  taskName: string;
  action: string;
  before: TaskSnapshot;
  after: TaskSnapshot;
  at: string;
}

interface ChangeGroup {
  taskId: string;
  taskName: string;
  original: TaskSnapshot; // before the first change from this page
  latest: TaskSnapshot; // after the most recent change from this page
  count: number;
}

interface Toast {
  id: number;
  tone: 'success' | 'error' | 'info';
  text: string;
  undoTaskId?: string;
}

interface Flyer {
  id: number;
  text: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

interface Reveal {
  scope: 'team' | 'player';
  who: string;
  decoration: Decoration;
}

interface DecorationModalState {
  decoration: Decoration;
  scope: 'team' | 'player';
  who: string;
  xp: number;
  level: number;
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
function levelFor(xp: number): number {
  return 1 + Math.floor(xp / XP_PER_LEVEL);
}

function getChoices(field: Field | undefined | null): Choice[] {
  const options = field?.options as { choices?: Choice[] } | null | undefined;
  return options?.choices ?? [];
}

// REFINED: find a choice by ID first, then by name as a fallback.
function resolveChoice(
  field: Field | undefined | null,
  choiceId: string,
  fallbackName: string
): ResolvedChoice {
  const choices = getChoices(field);
  const byId = choices.find((c) => c.id === choiceId);
  if (byId) return { choice: byId, matchedBy: 'id' };
  const byName = choices.find(
    (c) => c.name.trim().toLowerCase() === fallbackName.trim().toLowerCase()
  );
  if (byName) return { choice: byName, matchedBy: 'name' };
  return { choice: null, matchedBy: 'missing' };
}

// REFINED: color the Timing Alert pill by what the formula says.
type TimingTone = 'red' | 'yellow' | 'green' | 'gray';
function timingAlertTone(text: string): TimingTone {
  const lower = text.toLowerCase();
  if (text.includes('🔴') || lower.includes('overdue')) return 'red';
  if (text.includes('🟡') || lower.includes('due soon')) return 'yellow';
  if (text.includes('🟢') || lower.includes('on track')) return 'green';
  return 'gray';
}
const TIMING_TONE_CLASSES: Record<TimingTone, string> = {
  red: 'bg-red-redLight2 text-red-redDark1 dark:bg-red-redDark1 dark:text-red-redLight1',
  yellow:
    'bg-yellow-yellowLight2 text-yellow-yellowDark1 dark:bg-yellow-yellowDark1 dark:text-yellow-yellowLight1',
  green:
    'bg-green-greenLight2 text-green-greenDark1 dark:bg-green-greenDark1 dark:text-green-greenLight1',
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

function sameTime(a: string | null, b: string | null): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return new Date(a).getTime() === new Date(b).getTime();
}

function sameSnapshot(a: TaskSnapshot, b: TaskSnapshot): boolean {
  return a.statusId === b.statusId && a.done === b.done && sameTime(a.completedAt, b.completedAt);
}

function snapshotOf(task: TaskRecord): TaskSnapshot {
  return { statusId: task.statusId, done: task.done, completedAt: task.completedAt };
}

// REFINED: the undo list is saved in this browser so it survives a refresh.
// If the browser blocks storage, the list lasts until the page is closed.
function logStorageKey(tableId: string): string {
  return `questwood:change-log:${tableId}`;
}

function readStoredLog(tableId: string): { entries: ChangeLogEntry[]; available: boolean } {
  try {
    const raw = window.localStorage.getItem(logStorageKey(tableId));
    const parsed = raw ? JSON.parse(raw) : [];
    const entries = Array.isArray(parsed)
      ? parsed.filter(
          (e: any) =>
            e && typeof e.taskId === 'string' && e.before && e.after && typeof e.at === 'string'
        )
      : [];
    return { entries, available: true };
  } catch {
    return { entries: [], available: false };
  }
}

function writeStoredLog(tableId: string, entries: ChangeLogEntry[]): boolean {
  try {
    window.localStorage.setItem(logStorageKey(tableId), JSON.stringify(entries.slice(-200)));
    return true;
  } catch {
    return false;
  }
}

function groupChangeLog(entries: ChangeLogEntry[]): ChangeGroup[] {
  const byTask = new Map<string, ChangeGroup>();
  entries.forEach((entry) => {
    const existing = byTask.get(entry.taskId);
    if (existing) {
      existing.latest = entry.after;
      existing.count += 1;
      existing.taskName = entry.taskName;
    } else {
      byTask.set(entry.taskId, {
        taskId: entry.taskId,
        taskName: entry.taskName,
        original: entry.before,
        latest: entry.after,
        count: 1,
      });
    }
  });
  // A task that ended up exactly where it started has nothing to undo.
  return Array.from(byTask.values()).filter((g) => !sameSnapshot(g.original, g.latest));
}

// ----------------------------------------------------------------------------
// Custom properties (properties panel). Defined at module level on purpose.
// ----------------------------------------------------------------------------
function getCustomProperties(base: any) {
  // REFINED: no silent fallback to the first tables in the base. If these
  // tables are renamed, the setup message appears instead of wrong data.
  const caseTasksTable = base.tables.find((t: Table) => t.name === 'Case Tasks');
  const staffTable = base.tables.find((t: Table) => t.name === 'Staff');

  return [
    {
      key: 'tasksTable',
      label: 'Tasks',
      type: 'table' as const,
      defaultValue: caseTasksTable,
    },
    {
      key: 'staffTable',
      label: 'Staff',
      type: 'table' as const,
      defaultValue: staffTable,
    },
    {
      key: 'nameField',
      label: 'Task name',
      type: 'field' as const,
      table: caseTasksTable,
      defaultValue: caseTasksTable?.fields.find((f: Field) => f.name === 'Name'),
    },
    {
      key: 'statusField',
      label: 'Status',
      type: 'field' as const,
      table: caseTasksTable,
      shouldFieldBeAllowed: (field: { config: { type: FieldType } }) =>
        field.config.type === FieldType.SINGLE_SELECT,
      defaultValue: caseTasksTable?.fields.find((f: Field) => f.name === 'Status'),
    },
    {
      key: 'responsibleRoleField',
      label: 'Responsible role',
      type: 'field' as const,
      table: caseTasksTable,
      shouldFieldBeAllowed: (field: { config: { type: FieldType } }) =>
        field.config.type === FieldType.SINGLE_SELECT,
      defaultValue: caseTasksTable?.fields.find((f: Field) => f.name === 'Responsible Role'),
    },
    {
      key: 'assignedStaffField',
      label: 'Assigned staff',
      type: 'field' as const,
      table: caseTasksTable,
      shouldFieldBeAllowed: (field: { config: { type: FieldType } }) =>
        field.config.type === FieldType.MULTIPLE_RECORD_LINKS,
      defaultValue: caseTasksTable?.fields.find((f: Field) => f.name === 'Assigned Staff'),
    },
    {
      key: 'applicationField',
      label: 'Application',
      type: 'field' as const,
      table: caseTasksTable,
      shouldFieldBeAllowed: (field: { config: { type: FieldType } }) =>
        field.config.type === FieldType.MULTIPLE_RECORD_LINKS,
      defaultValue: caseTasksTable?.fields.find((f: Field) => f.name === 'Application'),
    },
    {
      key: 'internalDueField',
      label: 'Internal due',
      type: 'field' as const,
      table: caseTasksTable,
      shouldFieldBeAllowed: (field: { config: { type: FieldType } }) =>
        field.config.type === FieldType.DATE_TIME || field.config.type === FieldType.DATE,
      defaultValue: caseTasksTable?.fields.find((f: Field) => f.name === 'Internal Due At'),
    },
    {
      key: 'timingAlertField',
      label: 'Timing alert',
      type: 'field' as const,
      table: caseTasksTable,
      defaultValue: caseTasksTable?.fields.find((f: Field) => f.name === 'Timing Alert'),
    },
    {
      key: 'notesField',
      label: 'Notes',
      type: 'field' as const,
      table: caseTasksTable,
      defaultValue: caseTasksTable?.fields.find((f: Field) => f.name === 'Notes'),
    },
    {
      key: 'doneField',
      label: 'Done',
      type: 'field' as const,
      table: caseTasksTable,
      shouldFieldBeAllowed: (field: { config: { type: FieldType } }) =>
        field.config.type === FieldType.CHECKBOX,
      defaultValue: caseTasksTable?.fields.find((f: Field) => f.name === 'Done'),
    },
    {
      key: 'completedAtField',
      label: 'Completed at',
      type: 'field' as const,
      table: caseTasksTable,
      shouldFieldBeAllowed: (field: { config: { type: FieldType } }) =>
        field.config.type === FieldType.DATE_TIME || field.config.type === FieldType.DATE,
      defaultValue: caseTasksTable?.fields.find((f: Field) => f.name === 'Completed At'),
    },
    {
      key: 'staffNameField',
      label: 'Staff name',
      type: 'field' as const,
      table: staffTable,
      defaultValue: staffTable?.fields.find((f: Field) => f.name === 'Staff Name'),
    },
    {
      key: 'roleField',
      label: 'Role',
      type: 'field' as const,
      table: staffTable,
      shouldFieldBeAllowed: (field: { config: { type: FieldType } }) =>
        field.config.type === FieldType.SINGLE_SELECT,
      defaultValue: staffTable?.fields.find((f: Field) => f.name === 'Role'),
    },
    // REFINED: switches for the page builder, no code needed.
    {
      key: 'simpleCelebrations',
      label: 'Simple celebrations (no flying points)',
      type: 'boolean' as const,
      defaultValue: false,
    },
    {
      key: 'showDiagnostics',
      label: 'Show diagnostics panel',
      type: 'boolean' as const,
      defaultValue: false,
    },
  ];
}

// ----------------------------------------------------------------------------
// Small components
// ----------------------------------------------------------------------------
function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="How Questwood works"
        className="qw-fade-in bg-[#FDF8F3] dark:bg-[#3D3B38] rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#4A5D3A] to-[#6B8E4E] p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <QuestionIcon size={24} weight="fill" />
            <h2 className="font-bold text-lg">How Questwood Works</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10"
          >
            <XIcon size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[calc(80vh-60px)] space-y-5">
          <section>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
              <StarIcon size={18} weight="fill" className="text-purple-purple" />
              Earning XP
            </h3>
            <div className="bg-[#F5E6D3] dark:bg-[#2D2B28] rounded-lg p-3">
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircleIcon size={16} className="text-green-green mt-0.5 flex-shrink-0" />
                  <span>
                    Each completed task earns{' '}
                    <strong className="text-[#C4A35A]">{XP_PER_TASK} XP</strong> for the team
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon size={16} className="text-green-green mt-0.5 flex-shrink-0" />
                  <span>
                    XP is <strong>split equally</strong> among the assigned paraprofessionals
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircleIcon size={16} className="text-green-green mt-0.5 flex-shrink-0" />
                  <span>
                    Example: a task with 2 assigned staff ={' '}
                    <strong className="text-[#C4A35A]">12.5 XP each</strong>
                  </span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
              <TrophyIcon size={18} weight="fill" className="text-yellow-yellow" />
              Leveling Up
            </h3>
            <div className="bg-[#F5E6D3] dark:bg-[#2D2B28] rounded-lg p-3">
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-purple font-bold">•</span>
                  <span>
                    Every <strong className="text-[#C4A35A]">{XP_PER_LEVEL} XP</strong> = 1 level,
                    for each player and for the team
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-purple font-bold">•</span>
                  <span>Team levels grow the team garden</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-purple font-bold">•</span>
                  <span>
                    Your own levels grow your personal garden (pick yourself on the leaderboard to
                    see it)
                  </span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
              <FlowerLotusIcon size={18} weight="fill" className="text-green-green" />
              Garden Decorations
            </h3>
            <div className="bg-[#F5E6D3] dark:bg-[#2D2B28] rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2">
                {DECORATIONS.map((dec) => {
                  const Icon = dec.icon;
                  const tasksNeeded = Math.ceil(dec.xpRequired / XP_PER_TASK);
                  return (
                    <div
                      key={dec.level}
                      className="flex items-center gap-2 p-2 bg-white/50 dark:bg-black/20 rounded-md"
                    >
                      <Icon size={20} weight="fill" style={{ color: dec.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                          {dec.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Lvl {dec.level} • {dec.xpRequired} XP ({tasksNeeded} solo tasks)
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
              <ArrowCounterClockwiseIcon size={18} weight="bold" className="text-blue-blue" />
              Made a mistake?
            </h3>
            <div className="bg-[#F5E6D3] dark:bg-[#2D2B28] rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Every change you make here is real Airtable data. Use <strong>Undo</strong> in the
                message that appears after each change, or <strong>Undo all</strong> in the "Your
                changes" box. Undo puts Status, Done and Completed At back exactly as they were.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  tone,
  icon,
  label,
  title,
}: {
  onClick: () => void;
  disabled: boolean;
  tone: 'start' | 'complete' | 'reopen';
  icon: React.ReactNode;
  label: string;
  title?: string;
}) {
  const toneClass =
    tone === 'start'
      ? 'bg-yellow-yellow'
      : tone === 'complete'
      ? 'bg-green-green'
      : 'bg-gray-500 dark:bg-gray-600';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-md shadow-xs hover:shadow-sm hover:cursor-pointer text-white disabled:opacity-50 disabled:cursor-not-allowed ${toneClass}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// REFINED: the "+25 XP" tag that flies from the finished card to Team XP.
// It measures both ends at the moment it starts, so layout changes don't matter.
function FlyingPoints({ flyer, onDone }: { flyer: Flyer; onDone: (id: number) => void }) {
  const moverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mover = moverRef.current;
    let frameA = 0;
    let frameB = 0;
    // Two frames so the start position is painted before the move begins.
    frameA = window.requestAnimationFrame(() => {
      frameB = window.requestAnimationFrame(() => {
        if (!mover) return;
        const dx = flyer.to.x - flyer.from.x;
        const dy = flyer.to.y - flyer.from.y;
        mover.style.transform = `translate(${dx}px, ${dy}px) scale(0.7)`;
        mover.style.opacity = '0.15';
      });
    });
    const timer = window.setTimeout(() => onDone(flyer.id), CELEBRATION.flyDurationMs + 80);
    return () => {
      window.cancelAnimationFrame(frameA);
      window.cancelAnimationFrame(frameB);
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={moverRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: flyer.from.x,
        top: flyer.from.y,
        zIndex: 60,
        pointerEvents: 'none',
        transform: 'translate(0px, 0px) scale(1)',
        opacity: 1,
        transition: `transform ${CELEBRATION.flyDurationMs}ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity ${CELEBRATION.flyDurationMs}ms ease-in`,
      }}
    >
      <div className="-translate-x-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-1 rounded-full bg-[#C4A35A] text-white font-bold text-sm shadow-lg whitespace-nowrap">
        <StarIcon size={14} weight="fill" />
        {flyer.text}
      </div>
    </div>
  );
}

function ToastStack({
  toasts,
  canUndo,
  onUndo,
  onDismiss,
}: {
  toasts: Toast[];
  canUndo: (taskId: string) => boolean;
  onUndo: (taskId: string) => void;
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[min(92vw,420px)]"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`qw-fade-in flex items-start gap-2 rounded-lg shadow-lg px-3 py-2 text-sm border ${
            toast.tone === 'error'
              ? 'bg-[#FDECEC] text-[#8A1C1C] border-[#F5B5B5] dark:bg-[#3A1F1F] dark:text-[#F5B5B5] dark:border-[#6B2A2A]'
              : toast.tone === 'success'
              ? 'bg-[#EEF6E8] text-[#2F4A1F] border-[#BFD9AE] dark:bg-[#23301B] dark:text-[#CDE6BC] dark:border-[#3F5A2E]'
              : 'bg-white text-gray-700 border-gray-200 dark:bg-[#2D2B28] dark:text-gray-200 dark:border-[#5D5B58]'
          }`}
        >
          <span className="flex-1">{toast.text}</span>
          {toast.undoTaskId && canUndo(toast.undoTaskId) && (
            <button
              onClick={() => {
                onUndo(toast.undoTaskId as string);
                onDismiss(toast.id);
              }}
              className="font-semibold underline hover:no-underline"
            >
              Undo
            </button>
          )}
          <button
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss message"
            className="opacity-70 hover:opacity-100"
          >
            <XIcon size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function RevealModal({
  reveal,
  remaining,
  onNext,
}: {
  reveal: Reveal;
  remaining: number;
  onNext: () => void;
}) {
  const Icon = reveal.decoration.icon;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onNext}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="New decoration unlocked"
        className="qw-fade-in bg-[#FDF8F3] dark:bg-[#3D3B38] rounded-lg p-6 max-w-sm w-full shadow-xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
          {reveal.scope === 'team' ? 'Team garden' : `${reveal.who}'s garden`}
        </p>
        <div className="qw-grow inline-flex">
          <Icon size={72} weight="fill" style={{ color: reveal.decoration.color }} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-3">
          {reveal.decoration.name} unlocked!
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {reveal.scope === 'team' ? 'The team' : reveal.who} reached Level {reveal.decoration.level}.
        </p>
        <button
          onClick={onNext}
          className="mt-4 px-4 py-2 bg-[#4A5D3A] text-white rounded-md hover:bg-[#3D4A32] transition-colors"
        >
          {remaining > 0 ? `Next (${remaining} more)` : 'Awesome!'}
        </button>
      </div>
    </div>
  );
}

function DecorationModal({
  modal,
  onClose,
}: {
  modal: DecorationModalState;
  onClose: () => void;
}) {
  const { decoration, scope, who, xp, level } = modal;
  const unlocked = level >= decoration.level;
  const Icon = decoration.icon;
  const xpNeeded = Math.max(0, decoration.xpRequired - xp);
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={decoration.name}
        className="qw-fade-in bg-[#FDF8F3] dark:bg-[#3D3B38] rounded-lg p-6 max-w-sm w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <Icon
            size={64}
            weight="fill"
            style={{ color: unlocked ? decoration.color : '#999' }}
            className={`mx-auto mb-4 ${unlocked ? '' : 'opacity-50'}`}
          />
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
            {scope === 'team' ? 'Team garden' : `${who}'s garden`}
          </p>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            {decoration.name}
          </h3>
          {unlocked ? (
            <p className="text-green-green font-medium flex items-center justify-center gap-2">
              <CheckCircleIcon size={20} weight="fill" />
              Unlocked at Level {decoration.level}
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-600 dark:text-gray-400">
                Reach <span className="font-bold text-purple-purple">Level {decoration.level}</span>{' '}
                to unlock this decoration.
              </p>
              <div className="bg-[#F5E6D3] dark:bg-[#2D2B28] rounded-lg p-3 space-y-2 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">XP required:</span>
                  <span className="font-medium text-[#C4A35A]">{decoration.xpRequired} XP</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {scope === 'team' ? 'Team XP now:' : `${who}'s XP now:`}
                  </span>
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    {Number.isInteger(xp) ? xp : xp.toFixed(1)}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#D4C4A8] dark:border-[#5D5B58]">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Need{' '}
                    <span className="font-medium text-purple-purple">
                      {Number.isInteger(xpNeeded) ? xpNeeded : xpNeeded.toFixed(1)} more XP
                    </span>{' '}
                    {scope === 'team'
                      ? `(${Math.ceil(xpNeeded / XP_PER_TASK)} more completed tasks)`
                      : `(about ${Math.ceil(xpNeeded / XP_PER_TASK)} more solo tasks)`}
                  </p>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-[#4A5D3A] text-white rounded-md hover:bg-[#3D4A32] transition-colors"
          >
            {unlocked ? 'Awesome!' : 'Keep Questing!'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Main element
// ----------------------------------------------------------------------------
function QuestwoodApp(): React.ReactElement {
  useBase(); // keeps the element in sync with schema changes (renamed choices, fields)
  const { customPropertyValueByKey, errorState } = useCustomProperties(getCustomProperties);

  const tasksTable = customPropertyValueByKey.tasksTable as Table | undefined;
  const staffTable = customPropertyValueByKey.staffTable as Table | undefined;

  const nameField = customPropertyValueByKey.nameField as Field | undefined;
  const statusField = customPropertyValueByKey.statusField as Field | undefined;
  const responsibleRoleField = customPropertyValueByKey.responsibleRoleField as Field | undefined;
  const assignedStaffField = customPropertyValueByKey.assignedStaffField as Field | undefined;
  const applicationField = customPropertyValueByKey.applicationField as Field | undefined;
  const internalDueField = customPropertyValueByKey.internalDueField as Field | undefined;
  const timingAlertField = customPropertyValueByKey.timingAlertField as Field | undefined;
  const notesField = customPropertyValueByKey.notesField as Field | undefined;
  const doneField = customPropertyValueByKey.doneField as Field | undefined;
  const completedAtField = customPropertyValueByKey.completedAtField as Field | undefined;
  const staffNameField = customPropertyValueByKey.staffNameField as Field | undefined;
  const roleField = customPropertyValueByKey.roleField as Field | undefined;
  const simpleCelebrations = customPropertyValueByKey.simpleCelebrations === true;
  const showDiagnostics = customPropertyValueByKey.showDiagnostics === true;

  const taskRecords = useRecords(tasksTable ?? null);
  const staffRecords = useRecords(staffTable ?? null);

  // REFINED: choices are resolved on every render (only a handful), so a
  // renamed choice is picked up right away.
  const statusChoices = getChoices(statusField);
  const statusResolved = {
    open: resolveChoice(statusField, CHOICE_IDS.status.open, CHOICE_NAME_FALLBACKS.open),
    inProgress: resolveChoice(
      statusField,
      CHOICE_IDS.status.inProgress,
      CHOICE_NAME_FALLBACKS.inProgress
    ),
    complete: resolveChoice(
      statusField,
      CHOICE_IDS.status.complete,
      CHOICE_NAME_FALLBACKS.complete
    ),
  };
  const taskParaResolved = resolveChoice(
    responsibleRoleField,
    CHOICE_IDS.taskRoleParaprofessional,
    CHOICE_NAME_FALLBACKS.paraprofessional
  );
  const staffParaResolved = resolveChoice(
    roleField,
    CHOICE_IDS.staffRoleParaprofessional,
    CHOICE_NAME_FALLBACKS.paraprofessional
  );
  const statusOpenId = statusResolved.open.choice?.id ?? null;
  const statusInProgressId = statusResolved.inProgress.choice?.id ?? null;
  const statusCompleteId = statusResolved.complete.choice?.id ?? null;
  const taskParaId = taskParaResolved.choice?.id ?? null;
  const staffParaId = staffParaResolved.choice?.id ?? null;

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 'all' or a choice ID
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());
  const [savingTasks, setSavingTasks] = useState<Set<string>>(new Set());
  const [saveErrors, setSaveErrors] = useState<Map<string, string>>(new Map());
  const [decorationModal, setDecorationModal] = useState<DecorationModalState | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);

  // REFINED: celebration state
  const [celebratingIds, setCelebratingIds] = useState<Set<string>>(new Set());
  const [holdIds, setHoldIds] = useState<Set<string>>(new Set());
  const [flyers, setFlyers] = useState<Flyer[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [reveals, setReveals] = useState<Reveal[]>([]);
  const [recentShares, setRecentShares] = useState<Map<string, number>>(new Map());
  const [xpBumpKey, setXpBumpKey] = useState(0);
  const [flowerGrowing, setFlowerGrowing] = useState(false);

  // REFINED: undo list state
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  const [logLoadedFor, setLogLoadedFor] = useState<string | null>(null);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [confirmUndoAll, setConfirmUndoAll] = useState(false);
  const [undoAllBusy, setUndoAllBusy] = useState(false);

  // REFINED: a lock that blocks double clicks before React re-renders.
  const savingLockRef = useRef<Set<string>>(new Set());
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const teamXpRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<Set<number>>(new Set());
  const nextIdRef = useRef(1);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionOn = !prefersReducedMotion;
  const flyingOn = motionOn && !simpleCelebrations;

  const tasksTableId = tasksTable?.id ?? null;

  // Load the undo list for this table from the browser.
  useEffect(() => {
    if (!tasksTableId) return;
    const { entries, available } = readStoredLog(tasksTableId);
    setChangeLog(entries);
    setStorageAvailable(available);
    setLogLoadedFor(tasksTableId);
  }, [tasksTableId]);

  // Save the undo list whenever it changes (only after it has been loaded).
  useEffect(() => {
    if (!tasksTableId || logLoadedFor !== tasksTableId) return;
    const ok = writeStoredLog(tasksTableId, changeLog);
    if (!ok) setStorageAvailable(false);
  }, [changeLog, tasksTableId, logLoadedFor]);

  // Clear any pending timers if the element closes.
  useEffect(() => {
    const timeouts = timeoutsRef.current;
    return () => {
      timeouts.forEach((t) => window.clearTimeout(t));
      timeouts.clear();
    };
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    const handle = window.setTimeout(() => {
      timeoutsRef.current.delete(handle);
      fn();
    }, ms);
    timeoutsRef.current.add(handle);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = nextIdRef.current++;
      setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
      later(() => dismissToast(id), CELEBRATION.toastMs);
    },
    [later, dismissToast]
  );

  const removeFlyer = useCallback((id: number) => {
    setFlyers((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const paraprofessionals = useMemo<Staff[]>(() => {
    if (!staffRecords || !staffNameField || !roleField || !staffParaId) return [];
    return staffRecords
      .filter((r) => {
        const role = r.getCellValue(roleField) as { id: string } | null;
        return role?.id === staffParaId;
      })
      .map((r) => ({
        id: r.id,
        name: (r.getCellValue(staffNameField) as string | null) || 'Unknown',
        role: 'Paraprofessional',
      }));
  }, [staffRecords, staffNameField, roleField, staffParaId]);

  const paraStaffIdSet = useMemo(
    () => new Set(paraprofessionals.map((p) => p.id)),
    [paraprofessionals]
  );

  const eligibleTasks = useMemo<TaskRecord[]>(() => {
    if (
      !taskRecords ||
      !nameField ||
      !statusField ||
      !responsibleRoleField ||
      !assignedStaffField ||
      !taskParaId
    )
      return [];

    const statusKeyFor = (id: string | null): StatusKey => {
      if (id === null) return 'open';
      if (id === statusCompleteId) return 'complete';
      if (id === statusInProgressId) return 'inProgress';
      if (id === statusOpenId) return 'open';
      return 'other';
    };

    return taskRecords
      .filter((r) => {
        const respRole = r.getCellValue(responsibleRoleField) as { id: string } | null;
        return respRole?.id === taskParaId;
      })
      .map((r) => {
        const status = r.getCellValue(statusField) as { id: string; name: string } | null;
        const assignedStaff = (r.getCellValue(assignedStaffField) as { id: string }[] | null) ?? [];
        const internalDue = internalDueField
          ? (r.getCellValue(internalDueField) as string | null)
          : null;
        const timingAlert = timingAlertField
          ? (r.getCellValue(timingAlertField) as string | null)
          : null;
        const notes = notesField ? (r.getCellValue(notesField) as string | null) : null;
        const done = doneField ? (r.getCellValue(doneField) as boolean | null) : null;
        const completedAt = completedAtField
          ? (r.getCellValue(completedAtField) as string | null)
          : null;
        const statusId = status?.id ?? null;

        return {
          id: r.id,
          name: (r.getCellValue(nameField) as string | null) || 'Untitled Task',
          statusKey: statusKeyFor(statusId),
          statusId,
          statusName: status?.name ?? 'No status',
          internalDueAt: internalDue ?? null,
          timingAlert: typeof timingAlert === 'string' ? timingAlert : '',
          notes: notes || '',
          assignedStaffIds: assignedStaff.map((s) => s.id),
          done: done === true,
          completedAt: completedAt ?? null,
          record: r,
        };
      });
  }, [
    taskRecords,
    nameField,
    statusField,
    responsibleRoleField,
    assignedStaffField,
    internalDueField,
    timingAlertField,
    notesField,
    doneField,
    completedAtField,
    taskParaId,
    statusOpenId,
    statusInProgressId,
    statusCompleteId,
  ]);

  const taskById = useMemo(() => {
    const map = new Map<string, TaskRecord>();
    eligibleTasks.forEach((t) => map.set(t.id, t));
    return map;
  }, [eligibleTasks]);

  const { teamXP, playerXpById, leaderboard } = useMemo(() => {
    const completedTasks = eligibleTasks.filter((t) => t.statusKey === 'complete');
    let teamTotal = 0;
    const playerXPMap = new Map<string, { xp: number; tasks: number }>();

    paraprofessionals.forEach((p) => {
      playerXPMap.set(p.id, { xp: 0, tasks: 0 });
    });

    completedTasks.forEach((task) => {
      teamTotal += XP_PER_TASK;
      const paraIds = task.assignedStaffIds.filter((id) => paraStaffIdSet.has(id));
      if (paraIds.length > 0) {
        const share = XP_PER_TASK / paraIds.length;
        paraIds.forEach((id) => {
          const current = playerXPMap.get(id);
          if (current) {
            playerXPMap.set(id, { xp: current.xp + share, tasks: current.tasks + 1 });
          }
        });
      }
    });

    const scores: PlayerScore[] = paraprofessionals.map((p) => {
      const data = playerXPMap.get(p.id) || { xp: 0, tasks: 0 };
      return {
        id: p.id,
        name: p.name,
        xp: data.xp,
        completedTasks: data.tasks,
        level: levelFor(data.xp),
        rank: 0,
      };
    });

    scores.sort((a, b) => b.xp - a.xp);

    let currentRank = 1;
    scores.forEach((score, idx) => {
      if (idx > 0 && scores[idx - 1]!.xp === score.xp) {
        score.rank = scores[idx - 1]!.rank;
      } else {
        score.rank = currentRank;
      }
      currentRank = idx + 2;
    });

    const xpById = new Map<string, number>();
    scores.forEach((s) => xpById.set(s.id, s.xp));

    return { teamXP: teamTotal, playerXpById: xpById, leaderboard: scores };
  }, [eligibleTasks, paraprofessionals, paraStaffIdSet]);

  const filteredTasks = useMemo(() => {
    let filtered = [...eligibleTasks];

    if (selectedPlayerId) {
      filtered = filtered.filter((t) => t.assignedStaffIds.includes(selectedPlayerId));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((t) => t.name.toLowerCase().includes(query));
    }

    if (statusFilter !== 'all') {
      // REFINED: a task that was just finished stays visible until its celebration ends.
      filtered = filtered.filter((t) => t.statusId === statusFilter || holdIds.has(t.id));
    }

    filtered.sort((a, b) => {
      // REFINED: a just-finished card keeps its place for a moment.
      const aComplete = a.statusKey === 'complete' && !holdIds.has(a.id);
      const bComplete = b.statusKey === 'complete' && !holdIds.has(b.id);
      if (aComplete !== bComplete) return aComplete ? 1 : -1;

      const aDate = a.internalDueAt ? new Date(a.internalDueAt).getTime() : Infinity;
      const bDate = b.internalDueAt ? new Date(b.internalDueAt).getTime() : Infinity;
      return aDate - bDate;
    });

    return filtered;
  }, [eligibleTasks, selectedPlayerId, searchQuery, statusFilter, holdIds]);

  const selectedPlayer = useMemo(() => {
    return leaderboard.find((p) => p.id === selectedPlayerId) || null;
  }, [leaderboard, selectedPlayerId]);

  const changeGroups = useMemo(() => groupChangeLog(changeLog), [changeLog]);
  const changeGroupByTask = useMemo(() => {
    const map = new Map<string, ChangeGroup>();
    changeGroups.forEach((g) => map.set(g.taskId, g));
    return map;
  }, [changeGroups]);

  // REFINED: permission is checked once for the whole page (hides buttons)
  // and again for each save (see changeStatus and undoTasks).
  const canEditTasks = !!tasksTable && tasksTable.hasPermissionToUpdateRecords();

  const choiceNameById = (id: string | null): string => {
    if (!id) return 'No status';
    return statusChoices.find((c) => c.id === id)?.name ?? 'a removed status';
  };

  // REFINED: turns a before/after pair into the smallest possible update.
  const buildUpdates = (
    current: TaskSnapshot,
    target: TaskSnapshot
  ): Record<string, unknown> | null => {
    if (!statusField || !doneField) return null;
    if (target.statusId && !statusChoices.some((c) => c.id === target.statusId)) return null;
    const updates: Record<string, unknown> = {};
    if (current.statusId !== target.statusId) {
      updates[statusField.id] = target.statusId ? { id: target.statusId } : null;
    }
    if (current.done !== target.done) {
      updates[doneField.id] = target.done ? true : null;
    }
    if (completedAtField && !sameTime(current.completedAt, target.completedAt)) {
      updates[completedAtField.id] = target.completedAt;
    }
    return updates;
  };

  const paraAssigneesOf = (task: TaskRecord): string[] =>
    task.assignedStaffIds.filter((id) => paraStaffIdSet.has(id));

  const getTaskXP = (task: TaskRecord) => {
    const paraIds = paraAssigneesOf(task);
    if (paraIds.length === 0) return XP_PER_TASK;
    return XP_PER_TASK / paraIds.length;
  };

  const launchFlyer = (taskId: string) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cardEl = cardRefs.current.get(taskId);
    const cardRect = cardEl?.getBoundingClientRect();
    const from =
      cardRect && cardRect.bottom > 0 && cardRect.top < vh
        ? { x: cardRect.left + cardRect.width / 2, y: cardRect.top + Math.min(cardRect.height / 2, 60) }
        : { x: vw / 2, y: vh / 2 };

    // REFINED: if Team XP is scrolled out of view, fly to the top edge instead.
    const targetRect = teamXpRef.current?.getBoundingClientRect();
    const targetVisible =
      !!targetRect &&
      targetRect.bottom > 0 &&
      targetRect.top < vh &&
      targetRect.right > 0 &&
      targetRect.left < vw;
    const to = targetVisible
      ? { x: targetRect!.left + targetRect!.width / 2, y: targetRect!.top + targetRect!.height / 2 }
      : { x: vw / 2, y: 24 };

    const id = nextIdRef.current++;
    setFlyers((prev) => [...prev, { id, text: `+${XP_PER_TASK} XP`, from, to }]);
    later(() => setXpBumpKey((k) => k + 1), CELEBRATION.flyDurationMs);
  };

  const celebrate = (task: TaskRecord, teamXpBefore: number, paraIds: string[]) => {
    const taskId = task.id;

    setCelebratingIds((prev) => new Set(prev).add(taskId));
    setHoldIds((prev) => new Set(prev).add(taskId));
    later(() => {
      setCelebratingIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
      setHoldIds((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    }, CELEBRATION.holdCardMs);

    if (flyingOn) {
      launchFlyer(taskId);
    } else {
      setXpBumpKey((k) => k + 1);
    }

    const share = paraIds.length > 0 ? XP_PER_TASK / paraIds.length : 0;
    if (share > 0) {
      setRecentShares((prev) => {
        const next = new Map(prev);
        paraIds.forEach((id) => next.set(id, share));
        return next;
      });
      later(() => {
        setRecentShares((prev) => {
          const next = new Map(prev);
          paraIds.forEach((id) => next.delete(id));
          return next;
        });
      }, CELEBRATION.shareBadgeMs);
    }

    setFlowerGrowing(true);
    later(() => setFlowerGrowing(false), CELEBRATION.flowerGrowMs);

    // Decorations unlocked by this completion (team and each player).
    const newReveals: Reveal[] = [];
    const teamLevelBefore = levelFor(teamXpBefore);
    const teamLevelAfter = levelFor(teamXpBefore + XP_PER_TASK);
    for (let lvl = teamLevelBefore + 1; lvl <= teamLevelAfter; lvl++) {
      const dec = DECORATIONS.find((d) => d.level === lvl);
      if (dec) newReveals.push({ scope: 'team', who: 'The team', decoration: dec });
    }
    paraIds.forEach((id) => {
      const before = playerXpById.get(id) ?? 0;
      const levelBefore = levelFor(before);
      const levelAfter = levelFor(before + share);
      const who = paraprofessionals.find((p) => p.id === id)?.name ?? 'A player';
      for (let lvl = levelBefore + 1; lvl <= levelAfter; lvl++) {
        const dec = DECORATIONS.find((d) => d.level === lvl);
        if (dec) newReveals.push({ scope: 'player', who, decoration: dec });
      }
    });
    if (newReveals.length > 0) {
      later(
        () => setReveals((prev) => [...prev, ...newReveals]),
        flyingOn ? CELEBRATION.flyDurationMs + 150 : 0
      );
    }
  };

  const changeStatus = async (task: TaskRecord, target: 'open' | 'inProgress' | 'complete') => {
    if (!tasksTable || !canEditTasks) return;
    // REFINED: blocks a fast double click before React has re-rendered.
    if (savingLockRef.current.has(task.id)) return;

    const targetId =
      target === 'complete' ? statusCompleteId : target === 'inProgress' ? statusInProgressId : statusOpenId;
    if (!targetId) {
      pushToast({ tone: 'error', text: "Can't find that status choice in the Status field." });
      return;
    }

    const before = snapshotOf(task);
    const after: TaskSnapshot = {
      statusId: targetId,
      done: target === 'complete',
      // Completing fills Completed At only if blank. Reopening keeps it (per spec).
      completedAt:
        target === 'complete' && !task.completedAt ? new Date().toISOString() : task.completedAt,
    };
    const updates = buildUpdates(before, after);
    if (!updates || Object.keys(updates).length === 0) return;

    // Captured before the save, so celebrations compare against the old scores.
    const wasComplete = task.statusKey === 'complete';
    const teamXpBefore = teamXP;
    const paraIds = paraAssigneesOf(task);

    savingLockRef.current.add(task.id);
    setSavingTasks((prev) => new Set(prev).add(task.id));
    setSaveErrors((prev) => {
      const next = new Map(prev);
      next.delete(task.id);
      return next;
    });

    try {
      if (!tasksTable.hasPermissionToUpdateRecords([{ id: task.id, fields: updates }])) {
        throw new Error('You do not have permission to update this task.');
      }

      await tasksTable.updateRecordAsync(task.id, updates);

      // REFINED: remember exactly what changed so it can be undone later.
      const actionLabel =
        target === 'complete' ? 'Completed' : target === 'inProgress' ? 'Started' : 'Reopened';
      setChangeLog((prev) => [
        ...prev,
        {
          taskId: task.id,
          taskName: task.name,
          action: actionLabel,
          before,
          after,
          at: new Date().toISOString(),
        },
      ]);

      if (target === 'complete' && !wasComplete) {
        celebrate(task, teamXpBefore, paraIds);
        pushToast({
          tone: 'success',
          text: `Completed "${task.name}" · +${XP_PER_TASK} team XP`,
          undoTaskId: task.id,
        });
      } else {
        pushToast({
          tone: 'info',
          text: `${actionLabel} "${task.name}"`,
          undoTaskId: task.id,
        });
      }
    } catch (err) {
      setSaveErrors((prev) => {
        const next = new Map(prev);
        next.set(task.id, err instanceof Error ? err.message : 'Failed to save');
        return next;
      });
    } finally {
      savingLockRef.current.delete(task.id);
      setSavingTasks((prev) => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  };

  // REFINED: puts tasks back exactly as they were before this page changed
  // them, including clearing Completed At dates this page added. A task that
  // someone changed since is left alone.
  const undoTasks = async (taskIds: string[]) => {
    if (!tasksTable || !canEditTasks) return;
    const records: Array<{ id: string; fields: Record<string, unknown> }> = [];
    const restoredIds = new Set<string>();
    const skipped: string[] = [];

    taskIds.forEach((taskId) => {
      const group = changeGroupByTask.get(taskId);
      if (!group) return;
      if (savingLockRef.current.has(taskId)) {
        skipped.push(`${group.taskName} (still saving)`);
        return;
      }
      const task = taskById.get(taskId);
      if (!task) {
        skipped.push(`${group.taskName} (no longer on this page)`);
        return;
      }
      const current = snapshotOf(task);
      if (!sameSnapshot(current, group.latest)) {
        skipped.push(`${group.taskName} (changed since)`);
        return;
      }
      const updates = buildUpdates(current, group.original);
      if (!updates) {
        skipped.push(`${group.taskName} (its old status no longer exists)`);
        return;
      }
      if (Object.keys(updates).length > 0) records.push({ id: taskId, fields: updates });
      restoredIds.add(taskId);
    });

    if (restoredIds.size === 0) {
      pushToast({
        tone: 'error',
        text: skipped.length ? `Nothing undone: ${skipped.join(', ')}.` : 'Nothing to undo.',
      });
      return;
    }

    restoredIds.forEach((id) => savingLockRef.current.add(id));
    setSavingTasks((prev) => {
      const next = new Set(prev);
      restoredIds.forEach((id) => next.add(id));
      return next;
    });

    try {
      if (records.length > 0) {
        if (!tasksTable.hasPermissionToUpdateRecords(records)) {
          throw new Error('You do not have permission to undo these changes.');
        }
        // Airtable accepts up to 50 records per update call.
        for (let i = 0; i < records.length; i += 50) {
          await tasksTable.updateRecordsAsync(records.slice(i, i + 50));
        }
      }
      setChangeLog((prev) => prev.filter((e) => !restoredIds.has(e.taskId)));
      pushToast({
        tone: skipped.length ? 'info' : 'success',
        text:
          `Undid ${restoredIds.size} task${restoredIds.size === 1 ? '' : 's'}.` +
          (skipped.length ? ` Left alone: ${skipped.join(', ')}.` : ''),
      });
    } catch (err) {
      pushToast({
        tone: 'error',
        text: err instanceof Error ? err.message : 'Undo failed. Nothing was changed.',
      });
    } finally {
      restoredIds.forEach((id) => savingLockRef.current.delete(id));
      setSavingTasks((prev) => {
        const next = new Set(prev);
        restoredIds.forEach((id) => next.delete(id));
        return next;
      });
    }
  };

  const handleUndoAll = async () => {
    setUndoAllBusy(true);
    try {
      await undoTasks(changeGroups.map((g) => g.taskId));
    } finally {
      setUndoAllBusy(false);
      setConfirmUndoAll(false);
    }
  };

  const toggleNotes = useCallback((taskId: string) => {
    setExpandedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getNextDecoration = (currentLevel: number) => {
    return DECORATIONS.find((dec) => dec.level > currentLevel);
  };

  // ---------------------------------------------------------------------------
  // Early returns (all hooks are above this line)
  // ---------------------------------------------------------------------------
  if (errorState) {
    return (
      <div className="min-h-screen bg-[#F5E6D3] dark:bg-[#2D2B28] flex items-center justify-center p-8">
        <div className="bg-white dark:bg-[#3D3B38] rounded-lg p-6 shadow-lg max-w-md text-center">
          <WarningIcon size={48} className="text-orange-orange mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Configuration Error
          </h2>
          {/* REFINED: the SDK returns the error as errorState.error (Omni read errorState.message, which is always empty) */}
          <p className="text-gray-600 dark:text-gray-300">
            {errorState.error?.message ?? 'Something went wrong while loading the settings.'}
          </p>
        </div>
      </div>
    );
  }

  if (
    !tasksTable ||
    !staffTable ||
    !nameField ||
    !statusField ||
    !responsibleRoleField ||
    !assignedStaffField
  ) {
    return (
      <div className="min-h-screen bg-[#F5E6D3] dark:bg-[#2D2B28] flex items-center justify-center p-8">
        <div className="bg-white dark:bg-[#3D3B38] rounded-lg p-6 shadow-lg max-w-md text-center">
          <TreeIcon size={48} className="text-green-green mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Configure Questwood
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Pick the Case Tasks and Staff tables and their fields in the properties panel to
            begin your adventure.
          </p>
        </div>
      </div>
    );
  }

  const teamLevel = levelFor(teamXP);
  const teamProgress = teamXP % XP_PER_LEVEL;
  const completedTaskCount = eligibleTasks.filter((t) => t.statusKey === 'complete').length;
  const nextDecoration = getNextDecoration(teamLevel);
  const xpToNextLevel = XP_PER_LEVEL - teamProgress;
  const tasksToNextLevel = Math.ceil(xpToNextLevel / XP_PER_TASK);
  const flowersShown = Math.min(completedTaskCount, MAX_FLOWERS_SHOWN);

  // REFINED: warn when a choice can't be found (or was only found by name).
  const choiceChecks: Array<{ label: string; resolved: ResolvedChoice; fieldName: string }> = [
    { label: CHOICE_NAME_FALLBACKS.open, resolved: statusResolved.open, fieldName: statusField.name },
    {
      label: CHOICE_NAME_FALLBACKS.inProgress,
      resolved: statusResolved.inProgress,
      fieldName: statusField.name,
    },
    {
      label: CHOICE_NAME_FALLBACKS.complete,
      resolved: statusResolved.complete,
      fieldName: statusField.name,
    },
    {
      label: CHOICE_NAME_FALLBACKS.paraprofessional,
      resolved: taskParaResolved,
      fieldName: responsibleRoleField.name,
    },
    {
      label: CHOICE_NAME_FALLBACKS.paraprofessional,
      resolved: staffParaResolved,
      fieldName: roleField?.name ?? 'Role',
    },
  ];
  const missingChoices = choiceChecks.filter((c) => c.resolved.matchedBy === 'missing');

  const openDecoration = (
    decoration: Decoration,
    scope: 'team' | 'player',
    who: string,
    xp: number,
    level: number
  ) => setDecorationModal({ decoration, scope, who, xp, level });

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#F5E6D3] to-[#E8D9C5] dark:from-[#2D2B28] dark:to-[#1F1E1B] overflow-auto">
      <style>{QW_STYLES}</style>

      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-0 w-32 h-48 opacity-20">
          <TreeIcon size={128} className="text-green-greenDark1" />
        </div>
        <div className="absolute top-0 right-0 w-32 h-48 opacity-20">
          <TreeIcon size={128} className="text-green-greenDark1" />
        </div>
        <div className="absolute bottom-0 left-10 w-16 h-16 opacity-30">
          <HouseIcon size={64} className="text-orange-orangeDark1" />
        </div>
        <div className="absolute bottom-10 right-20 w-16 h-16 opacity-30">
          <HouseIcon size={64} className="text-orange-orangeDark1" />
        </div>
      </div>

      <div className="relative z-10 p-4 lg:p-6">
        <header className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <TreeIcon size={36} weight="fill" className="text-green-green" />
            <h1 className="text-3xl lg:text-4xl font-display font-bold text-[#4A5D3A] dark:text-[#A8C686]">
              Questwood
            </h1>
            <TreeIcon size={36} weight="fill" className="text-green-green" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Complete tasks to grow your enchanted garden
          </p>
          <div className="mt-2 flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => setShowHelpModal(true)}
              className="inline-flex items-center gap-1.5 text-sm text-[#4A5D3A] dark:text-[#A8C686] hover:underline"
            >
              <QuestionIcon size={16} weight="bold" />
              How do I earn badges?
            </button>
            {!canEditTasks && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                <EyeIcon size={14} />
                View only
              </span>
            )}
          </div>
        </header>

        {missingChoices.length > 0 && (
          <div className="mb-4 p-3 rounded-lg border border-[#E8C170] bg-[#FFF6E0] text-[#6B4E0E] dark:border-[#7A5A1A] dark:bg-[#3A3222] dark:text-[#F3D58A] text-sm flex items-start gap-2">
            <WarningIcon size={18} className="flex-shrink-0 mt-0.5" />
            <span>
              Questwood can't find{' '}
              {missingChoices.map((c) => `"${c.label}" in ${c.fieldName}`).join(', ')}. Scores and
              buttons that depend on {missingChoices.length === 1 ? 'it' : 'them'} are turned off
              until the choice is back.
            </span>
          </div>
        )}

        <div className="bg-[#FDF8F3]/90 dark:bg-[#3D3B38]/90 backdrop-blur rounded-lg p-4 mb-6 shadow-md border border-[#D4C4A8] dark:border-[#5D5B58]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center" ref={teamXpRef}>
                <div className="flex items-center gap-2 text-[#C4A35A]">
                  <TrophyIcon size={24} weight="fill" />
                  <span
                    key={xpBumpKey}
                    className={`text-2xl font-bold inline-block ${xpBumpKey > 0 && motionOn ? 'qw-pop' : ''}`}
                  >
                    {teamXP.toFixed(0)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Team XP</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-green-green">
                  <CheckCircleIcon size={24} weight="fill" />
                  <span className="text-2xl font-bold">{completedTaskCount}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 text-purple-purple">
                  <StarIcon size={24} weight="fill" />
                  <span className="text-2xl font-bold">Lvl {teamLevel}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Team Level</p>
              </div>
            </div>

            <div className="flex-1 max-w-xs min-w-[180px]">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Level {teamLevel}</span>
                <span>
                  {teamProgress.toFixed(0)}/{XP_PER_LEVEL} XP
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-green-green to-green-greenLight1 ${
                    motionOn ? 'transition-all duration-500' : ''
                  }`}
                  style={{ width: `${teamProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {tasksToNextLevel} more task{tasksToNextLevel !== 1 ? 's' : ''} to Level{' '}
                {teamLevel + 1}
                {nextDecoration && (
                  <span className="ml-1">
                    • Unlocks{' '}
                    <span className="font-medium" style={{ color: nextDecoration.color }}>
                      {nextDecoration.name}
                    </span>
                  </span>
                )}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              {DECORATIONS.slice(0, 5).map((dec) => {
                const unlocked = teamLevel >= dec.level;
                const Icon = dec.icon;
                return (
                  <button
                    key={dec.level}
                    onClick={() => openDecoration(dec, 'team', 'The team', teamXP, teamLevel)}
                    aria-label={
                      unlocked
                        ? `${dec.name}, unlocked`
                        : `${dec.name}, unlocks at Level ${dec.level}`
                    }
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      motionOn ? 'transition-all duration-300' : ''
                    } ${
                      unlocked
                        ? 'bg-[#F5E6D3] dark:bg-[#4D4B48] shadow-sm hover:shadow-md'
                        : 'bg-gray-200 dark:bg-gray-700 opacity-50 cursor-pointer hover:opacity-75'
                    }`}
                    title={
                      unlocked
                        ? `${dec.name} (Unlocked!)`
                        : `${dec.name} - Unlock at Level ${dec.level} (${dec.xpRequired} XP)`
                    }
                  >
                    <Icon size={24} weight="fill" style={{ color: unlocked ? dec.color : '#999' }} />
                  </button>
                );
              })}
              <button
                onClick={() => setShowHelpModal(true)}
                aria-label="How do badges work?"
                className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-blueLight2 dark:bg-blue-blueDark1 text-blue-blue dark:text-blue-blueLight1 hover:shadow-md"
                title="How do badges work?"
              >
                <QuestionIcon size={20} weight="bold" />
              </button>
            </div>
          </div>
        </div>

        {/*
          REFINED: layout. At 768px and wider the leaderboard and garden sit
          beside the missions. On narrower screens the leaderboard (top 3)
          moves above the missions and the garden moves below them.
        */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="order-2 md:order-1 md:col-span-2 space-y-4 min-w-0" aria-label="Missions">
            <div className="bg-[#FDF8F3]/90 dark:bg-[#3D3B38]/90 backdrop-blur rounded-lg p-4 shadow-md border border-[#D4C4A8] dark:border-[#5D5B58]">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px]">
                  <MagnifyingGlassIcon
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    aria-label="Search missions"
                    placeholder="Search missions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-[#D4C4A8] dark:border-[#5D5B58] bg-white dark:bg-[#2D2B28] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-green"
                  />
                </div>

                {/* REFINED: status options come from the Status field itself. */}
                <select
                  aria-label="Filter by status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-md border border-[#D4C4A8] dark:border-[#5D5B58] bg-white dark:bg-[#2D2B28] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-green"
                >
                  <option value="all">All Status</option>
                  {statusChoices.map((choice) => (
                    <option key={choice.id} value={choice.id}>
                      {choice.name}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Filter by player"
                  value={selectedPlayerId || ''}
                  onChange={(e) => setSelectedPlayerId(e.target.value || null)}
                  className="px-3 py-2 rounded-md border border-[#D4C4A8] dark:border-[#5D5B58] bg-white dark:bg-[#2D2B28] text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-green"
                >
                  <option value="">All Players</option>
                  {paraprofessionals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* REFINED: "Your changes" box. Removes test data completely. */}
            {canEditTasks && changeGroups.length > 0 && (
              <div className="rounded-lg p-4 shadow-md border border-[#E8C170] bg-[#FFF6E0] dark:border-[#7A5A1A] dark:bg-[#3A3222]">
                <div className="flex items-start gap-2">
                  <ArrowCounterClockwiseIcon
                    size={20}
                    weight="bold"
                    className="flex-shrink-0 mt-0.5 text-[#8A6414] dark:text-[#F3D58A]"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#6B4E0E] dark:text-[#F3D58A]">
                      Your changes: {changeGroups.length} task{changeGroups.length === 1 ? '' : 's'}
                    </p>
                    <p className="text-xs text-[#6B4E0E]/80 dark:text-[#F3D58A]/80 mt-0.5">
                      These are real Airtable changes. Undo all puts Status, Done and Completed At
                      back exactly as they were, including clearing Completed At dates this page
                      added. Tasks someone else changed since are left alone.{' '}
                      {storageAvailable
                        ? 'This list is kept in this browser until you clear it.'
                        : 'This list clears when you close the page.'}
                    </p>
                    <ul className="mt-2 space-y-0.5 text-xs text-[#6B4E0E] dark:text-[#F3D58A]">
                      {changeGroups.slice(0, 5).map((g) => (
                        <li key={g.taskId} className="truncate">
                          {g.taskName}: was {choiceNameById(g.original.statusId)}, now{' '}
                          {choiceNameById(g.latest.statusId)}
                        </li>
                      ))}
                      {changeGroups.length > 5 && <li>and {changeGroups.length - 5} more</li>}
                    </ul>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  {confirmUndoAll ? (
                    <>
                      <span className="text-sm text-[#6B4E0E] dark:text-[#F3D58A]">
                        Undo all {changeGroups.length}?
                      </span>
                      <button
                        onClick={handleUndoAll}
                        disabled={undoAllBusy}
                        className="px-3 py-1.5 rounded-md bg-[#8A6414] text-white text-sm hover:bg-[#6B4E0E] disabled:opacity-50"
                      >
                        {undoAllBusy ? 'Undoing…' : 'Yes, undo all'}
                      </button>
                      <button
                        onClick={() => setConfirmUndoAll(false)}
                        disabled={undoAllBusy}
                        className="px-3 py-1.5 rounded-md border border-[#C9A24A] text-[#6B4E0E] dark:text-[#F3D58A] text-sm hover:bg-white/40 dark:hover:bg-black/20"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setConfirmUndoAll(true)}
                        className="px-3 py-1.5 rounded-md bg-[#8A6414] text-white text-sm hover:bg-[#6B4E0E]"
                      >
                        Undo all
                      </button>
                      <button
                        onClick={() => setChangeLog([])}
                        className="px-3 py-1.5 rounded-md border border-[#C9A24A] text-[#6B4E0E] dark:text-[#F3D58A] text-sm hover:bg-white/40 dark:hover:bg-black/20"
                        title="Keeps the changes in Airtable and clears this list"
                      >
                        Keep changes
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {selectedPlayer && (
              <div className="bg-gradient-to-r from-[#4A5D3A] to-[#6B8E4E] dark:from-[#3D4A32] dark:to-[#5A7C42] rounded-lg p-4 shadow-md text-white">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-xl font-bold">{selectedPlayer.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{selectedPlayer.name}</h3>
                      <p className="text-white/80 text-sm">Rank #{selectedPlayer.rank}</p>
                    </div>
                  </div>
                  <div className="flex gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{selectedPlayer.xp.toFixed(1)}</p>
                      <p className="text-xs text-white/70">XP</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">Lvl {selectedPlayer.level}</p>
                      <p className="text-xs text-white/70">Level</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{selectedPlayer.completedTasks}</p>
                      <p className="text-xs text-white/70">Tasks</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white/60"
                      style={{ width: `${selectedPlayer.xp % XP_PER_LEVEL}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/70 mt-1 text-right">
                    {(selectedPlayer.xp % XP_PER_LEVEL).toFixed(1)}/{XP_PER_LEVEL} XP to next level
                  </p>
                </div>

                {/* REFINED: the selected player's own garden */}
                <div className="mt-3">
                  <p className="text-xs text-white/80 mb-1.5">{selectedPlayer.name}'s garden</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {DECORATIONS.map((dec) => {
                      const unlocked = selectedPlayer.level >= dec.level;
                      const Icon = dec.icon;
                      return (
                        <button
                          key={dec.level}
                          onClick={() =>
                            openDecoration(
                              dec,
                              'player',
                              selectedPlayer.name,
                              selectedPlayer.xp,
                              selectedPlayer.level
                            )
                          }
                          aria-label={
                            unlocked
                              ? `${dec.name}, unlocked for ${selectedPlayer.name}`
                              : `${dec.name}, unlocks at Level ${dec.level} for ${selectedPlayer.name}`
                          }
                          className={`w-8 h-8 rounded-md flex items-center justify-center ${
                            unlocked ? 'bg-white/90' : 'bg-white/15 hover:bg-white/25'
                          }`}
                        >
                          <Icon
                            size={18}
                            weight="fill"
                            style={{ color: unlocked ? dec.color : 'rgba(255,255,255,0.55)' }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {filteredTasks.length === 0 ? (
                <div className="bg-[#FDF8F3]/90 dark:bg-[#3D3B38]/90 backdrop-blur rounded-lg p-8 shadow-md border border-[#D4C4A8] dark:border-[#5D5B58] text-center">
                  <FlowerLotusIcon size={48} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400">
                    No missions found. Try adjusting your filters.
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => {
                  const isSaving = savingTasks.has(task.id);
                  const error = saveErrors.get(task.id);
                  const isExpanded = expandedNotes.has(task.id);
                  const isCelebrating = celebratingIds.has(task.id);
                  const taskXP = getTaskXP(task);
                  const paraCount = paraAssigneesOf(task).length;
                  const tone = task.timingAlert ? timingAlertTone(task.timingAlert) : null;

                  return (
                    <div
                      key={task.id}
                      ref={(el) => {
                        if (el) cardRefs.current.set(task.id, el);
                        else cardRefs.current.delete(task.id);
                      }}
                      className={`relative bg-[#FDF8F3]/95 dark:bg-[#3D3B38]/95 backdrop-blur rounded-lg shadow-md border-2 ${
                        task.statusKey === 'complete'
                          ? 'border-green-greenLight1 dark:border-green-greenDark1'
                          : task.statusKey === 'inProgress'
                          ? 'border-yellow-yellowLight1 dark:border-yellow-yellowDark1'
                          : 'border-[#D4C4A8] dark:border-[#5D5B58]'
                      } ${isCelebrating ? 'ring-4 ring-yellow-yellow' : ''} overflow-hidden`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  task.statusKey === 'complete'
                                    ? 'bg-green-greenLight2 text-green-greenDark1 dark:bg-green-greenDark1 dark:text-green-greenLight1'
                                    : task.statusKey === 'inProgress'
                                    ? 'bg-yellow-yellowLight2 text-yellow-yellowDark1 dark:bg-yellow-yellowDark1 dark:text-yellow-yellowLight1'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                }`}
                              >
                                {task.statusName}
                              </span>
                              {/* REFINED: color follows the Timing Alert value */}
                              {task.timingAlert && tone && (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIMING_TONE_CLASSES[tone]}`}
                                >
                                  {task.timingAlert}
                                </span>
                              )}
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-purpleLight2 text-purple-purpleDark1 dark:bg-purple-purpleDark1 dark:text-purple-purpleLight1 flex items-center gap-1"
                                title={`Completing this task earns ${taskXP.toFixed(1)} XP${
                                  paraCount > 1
                                    ? ` (${XP_PER_TASK} XP split among ${paraCount} paraprofessionals)`
                                    : ''
                                }`}
                              >
                                <StarIcon size={12} weight="fill" />+{taskXP.toFixed(1)} XP
                              </span>
                            </div>

                            <button
                              onClick={() => {
                                if (tasksTable.hasPermissionToExpandRecords()) {
                                  expandRecord(task.record);
                                }
                              }}
                              className="text-left hover:underline"
                            >
                              <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-lg">
                                {task.name}
                              </h3>
                            </button>

                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                              {applicationField && (
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">Application:</span>
                                  <CellRenderer record={task.record} field={applicationField} />
                                </div>
                              )}
                              <div>
                                <span className="font-medium">Due:</span>{' '}
                                {formatDate(task.internalDueAt)}
                              </div>
                            </div>
                          </div>

                          {/* REFINED: buttons only for people who can edit */}
                          {canEditTasks ? (
                            <div className="flex flex-col gap-2">
                              {task.statusKey === 'open' && (
                                <>
                                  <ActionButton
                                    onClick={() => changeStatus(task, 'inProgress')}
                                    disabled={isSaving || !statusInProgressId}
                                    tone="start"
                                    icon={<PlayIcon size={16} />}
                                    label={isSaving ? 'Saving…' : 'Start'}
                                  />
                                  <ActionButton
                                    onClick={() => changeStatus(task, 'complete')}
                                    disabled={isSaving || !statusCompleteId}
                                    tone="complete"
                                    icon={<CheckCircleIcon size={16} />}
                                    label={isSaving ? 'Saving…' : 'Complete'}
                                  />
                                </>
                              )}
                              {task.statusKey === 'inProgress' && (
                                <ActionButton
                                  onClick={() => changeStatus(task, 'complete')}
                                  disabled={isSaving || !statusCompleteId}
                                  tone="complete"
                                  icon={<CheckCircleIcon size={16} />}
                                  label={isSaving ? 'Saving…' : 'Complete'}
                                />
                              )}
                              {task.statusKey === 'complete' && (
                                <ActionButton
                                  onClick={() => changeStatus(task, 'open')}
                                  disabled={isSaving || !statusOpenId}
                                  tone="reopen"
                                  icon={<ArrowCounterClockwiseIcon size={16} />}
                                  label={isSaving ? 'Saving…' : 'Reopen'}
                                />
                              )}
                              {task.statusKey === 'other' && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 max-w-[120px] text-right">
                                  "{task.statusName}" isn't part of the game
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                              <EyeIcon size={14} />
                              View only
                            </span>
                          )}
                        </div>

                        {error && (
                          <div className="mt-3 p-2 bg-red-redLight3 dark:bg-red-redDark1 rounded-md text-red-red dark:text-red-redLight1 text-sm flex items-center gap-2">
                            <WarningIcon size={16} />
                            {error}
                          </div>
                        )}

                        <button
                          onClick={() => toggleNotes(task.id)}
                          aria-expanded={isExpanded}
                          className="mt-3 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          {isExpanded ? <CaretUpIcon size={16} /> : <CaretDownIcon size={16} />}
                          <span>Notes</span>
                        </button>

                        {isExpanded && (
                          <div className="mt-2 p-3 bg-[#F5E6D3] dark:bg-[#2D2B28] rounded-md">
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                              {task.notes || 'No notes.'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* REFINED: sparkle pinned to this card */}
                      {isCelebrating && motionOn && (
                        <div
                          className="absolute inset-0 pointer-events-none flex items-center justify-center"
                          aria-hidden="true"
                        >
                          <div className="qw-sparkle">
                            <SparkleIcon size={64} weight="fill" className="text-yellow-yellow" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* On narrow screens this wrapper disappears, so its two panels can sit above and below the missions. */}
          <div className="contents md:block md:order-2 md:space-y-4">
            <aside
              className="order-1 md:order-none bg-[#FDF8F3]/90 dark:bg-[#3D3B38]/90 backdrop-blur rounded-lg shadow-md border border-[#D4C4A8] dark:border-[#5D5B58] overflow-hidden self-start"
              aria-label="Leaderboard"
            >
              <div className="bg-gradient-to-r from-[#C4A35A] to-[#D4B86A] p-4">
                <div className="flex items-center gap-2 text-white">
                  <TrophyIcon size={24} weight="fill" />
                  <h2 className="font-bold text-lg">Leaderboard</h2>
                </div>
              </div>

              <div className="p-4">
                {leaderboard.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">No players yet</p>
                ) : (
                  <div className="space-y-2">
                    {leaderboard.map((player, idx) => {
                      const isSelected = player.id === selectedPlayerId;
                      const recentShare = recentShares.get(player.id);
                      // REFINED: narrow screens show the top 3 plus the selected player.
                      const hideOnNarrow = idx >= 3 && !isSelected && !showFullLeaderboard;
                      return (
                        <button
                          key={player.id}
                          onClick={() => setSelectedPlayerId(isSelected ? null : player.id)}
                          aria-pressed={isSelected}
                          className={`w-full p-3 rounded-lg ${hideOnNarrow ? 'hidden md:block' : 'block'} ${
                            motionOn ? 'transition-all duration-200' : ''
                          } ${
                            isSelected
                              ? 'bg-[#4A5D3A] text-white'
                              : 'bg-[#F5E6D3] dark:bg-[#2D2B28] hover:bg-[#E8D9C5] dark:hover:bg-[#3D3B38]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                player.rank === 1
                                  ? 'bg-yellow-yellow text-white'
                                  : player.rank === 2
                                  ? 'bg-gray-400 text-white'
                                  : player.rank === 3
                                  ? 'bg-orange-orange text-white'
                                  : isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                              }`}
                            >
                              {player.rank}
                            </div>

                            <div className="flex-1 text-left min-w-0">
                              <p
                                className={`font-medium truncate ${
                                  isSelected ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                                }`}
                              >
                                {player.name}
                              </p>
                              <p
                                className={`text-xs ${
                                  isSelected ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                Level {player.level} • {player.completedTasks} tasks
                              </p>
                            </div>

                            <div className="text-right">
                              <p
                                className={`font-bold ${
                                  isSelected ? 'text-white' : 'text-[#C4A35A]'
                                }`}
                              >
                                {player.xp.toFixed(1)}
                              </p>
                              {recentShare !== undefined ? (
                                <p className="qw-rise text-xs font-bold text-green-green">
                                  +{recentShare.toFixed(1)}
                                </p>
                              ) : (
                                <p
                                  className={`text-xs ${
                                    isSelected ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                                  }`}
                                >
                                  XP
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {leaderboard.length > 3 && (
                      <button
                        onClick={() => setShowFullLeaderboard((v) => !v)}
                        className="md:hidden w-full text-sm text-[#4A5D3A] dark:text-[#A8C686] hover:underline pt-1"
                      >
                        {showFullLeaderboard ? 'Show top 3' : `Show all ${leaderboard.length} players`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </aside>

            <aside
              className="order-3 md:order-none bg-[#FDF8F3]/90 dark:bg-[#3D3B38]/90 backdrop-blur rounded-lg shadow-md border border-[#D4C4A8] dark:border-[#5D5B58] overflow-hidden self-start"
              aria-label="Team garden"
            >
              <div className="bg-gradient-to-r from-[#4A5D3A] to-[#6B8E4E] p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white">
                    <FlowerLotusIcon size={24} weight="fill" />
                    <h2 className="font-bold text-lg">Team Garden</h2>
                  </div>
                  <button
                    onClick={() => setShowHelpModal(true)}
                    aria-label="How do badges work?"
                    className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10"
                    title="How do badges work?"
                  >
                    <QuestionIcon size={18} weight="bold" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                {/* REFINED: one flower per completed task; the newest one grows in */}
                <div
                  className="flex flex-wrap gap-1 justify-center mb-3 min-h-[24px]"
                  aria-label={`${completedTaskCount} flowers, one per completed task`}
                >
                  {completedTaskCount === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Complete a task to plant the first flower.
                    </p>
                  ) : (
                    Array.from({ length: flowersShown }).map((_, i) => {
                      const isNewest = i === flowersShown - 1;
                      return (
                        <span
                          key={i}
                          className={`inline-flex ${isNewest && flowerGrowing && motionOn ? 'qw-grow' : ''}`}
                        >
                          <FlowerIcon
                            size={18}
                            weight="fill"
                            style={{ color: FLOWER_COLORS[i % FLOWER_COLORS.length] }}
                          />
                        </span>
                      );
                    })
                  )}
                  {completedTaskCount > MAX_FLOWERS_SHOWN && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
                      +{completedTaskCount - MAX_FLOWERS_SHOWN}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">
                  Earn {XP_PER_LEVEL} XP per level •{' '}
                  {Math.ceil(XP_PER_LEVEL / XP_PER_TASK)} tasks unlock the next decoration
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {DECORATIONS.map((dec) => {
                    const unlocked = teamLevel >= dec.level;
                    const Icon = dec.icon;
                    const tasksNeeded = Math.ceil(dec.xpRequired / XP_PER_TASK);
                    return (
                      <button
                        key={dec.level}
                        onClick={() => openDecoration(dec, 'team', 'The team', teamXP, teamLevel)}
                        aria-label={
                          unlocked ? `${dec.name}, unlocked` : `${dec.name}, unlocks at Level ${dec.level}`
                        }
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center p-2 ${
                          motionOn ? 'transition-all duration-300' : ''
                        } ${
                          unlocked
                            ? 'bg-[#F5E6D3] dark:bg-[#2D2B28] shadow-sm hover:shadow-md'
                            : 'bg-gray-200 dark:bg-gray-700 opacity-40 cursor-pointer hover:opacity-60'
                        }`}
                        title={
                          unlocked
                            ? `${dec.name} (Unlocked!)`
                            : `${dec.name} - Unlock at Level ${dec.level} (${dec.xpRequired} XP, ~${tasksNeeded} tasks)`
                        }
                      >
                        <Icon
                          size={28}
                          weight="fill"
                          style={{ color: unlocked ? dec.color : '#999' }}
                        />
                        <span
                          className={`text-xs mt-1 truncate w-full text-center ${
                            unlocked
                              ? 'text-gray-600 dark:text-gray-400'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        >
                          {unlocked ? dec.name : `${dec.xpRequired} XP`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* REFINED: diagnostics, switched on in the properties panel */}
        {showDiagnostics && (
          <div className="mt-6 p-4 bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-mono text-gray-700 dark:text-gray-300 space-y-1">
            <div>Build: {QUESTWOOD_VERSION}</div>
            <div>
              Tables: {tasksTable.name} ({taskRecords?.length ?? 0} records), {staffTable.name} (
              {staffRecords?.length ?? 0} records)
            </div>
            <div>
              Paraprofessional tasks: {eligibleTasks.length} · players: {paraprofessionals.length} ·
              team XP: {teamXP}
            </div>
            {choiceChecks.map((c, i) => (
              <div key={i}>
                Choice "{c.label}" in {c.fieldName}: {c.resolved.matchedBy}
                {c.resolved.choice ? ` (${c.resolved.choice.name})` : ''}
              </div>
            ))}
            <div>Can edit tasks: {canEditTasks ? 'yes' : 'no'}</div>
            <div>
              Undo list: {changeLog.length} entries, {changeGroups.length} tasks · saved in browser:{' '}
              {storageAvailable ? 'yes' : 'no'}
            </div>
            <div>
              Celebrations: {simpleCelebrations ? 'simple' : 'full'} · reduced motion:{' '}
              {prefersReducedMotion ? 'on' : 'off'}
            </div>
          </div>
        )}

        {/* REFINED: version stamp. If this line disappears, the refined build was overwritten. */}
        <p className="mt-6 text-center text-[11px] text-gray-400 dark:text-gray-500">
          Questwood {QUESTWOOD_VERSION}
        </p>
      </div>

      {flyers.map((flyer) => (
        <FlyingPoints key={flyer.id} flyer={flyer} onDone={removeFlyer} />
      ))}

      <ToastStack
        toasts={toasts}
        canUndo={(taskId) => canEditTasks && changeGroupByTask.has(taskId)}
        onUndo={(taskId) => {
          void undoTasks([taskId]);
        }}
        onDismiss={dismissToast}
      />

      {decorationModal && (
        <DecorationModal modal={decorationModal} onClose={() => setDecorationModal(null)} />
      )}

      {reveals.length > 0 && !decorationModal && (
        <RevealModal
          reveal={reveals[0]!}
          remaining={reveals.length - 1}
          onNext={() => setReveals((prev) => prev.slice(1))}
        />
      )}

      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} />}
    </div>
  );
}

initializeBlock({ interface: () => <QuestwoodApp /> });
