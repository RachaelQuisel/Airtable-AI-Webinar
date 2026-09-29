import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    initializeBlock,
    useBase,
    useRecords,
    useCustomProperties,
    CellRenderer,
    expandRecord,
} from '@airtable/blocks/interface/ui';
import type { Table, Record as AirtableRecord } from '@airtable/blocks/interface/models';
import {
    HouseIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    CircleIcon,
    CaretLeftIcon,
    CaretRightIcon,
    XIcon,
    FileIcon,
    WarningCircleIcon,
    SpinnerIcon,
    StarIcon,
    TrophyIcon,
    UserIcon,
    CaretDownIcon,
    CaretUpIcon,
} from '@phosphor-icons/react';
import confetti from 'canvas-confetti';

const DEFAULT_STAFF_RECORD_ID = 'recSag7S2CmUFEQDR';
// Tall enough for the name and progress text under houses that sit below the road.
const MAP_HEIGHT = 360;
// Case Tasks number field: the points a task earns. The Points formula awards this value once the task is complete.
const TASK_POINTS_FIELD_ID = 'fldKGgw7Cn9PESJ3w';
// useRecords returns null when its table is not configured. One shared empty list keeps
// downstream useMemo dependencies stable instead of creating a new [] on every render.
const NO_RECORDS: AirtableRecord[] = [];

function getCustomProperties(base: ReturnType<typeof useBase>) {
    const staffTable = base.tables.find(t => t.id === 'tbl2FOSSCsaIF0GJv');
    const familiesTable = base.tables.find(t => t.id === 'tblYUsvb1xUEhlbxE');
    const caseTasksTable = base.tables.find(t => t.id === 'tblMKzDaidInQg0fa');
    const applicantsTable = base.tables.find(t => t.id === 'tblRPr3e1OiY2JLhk');
    const requirementsTable = base.tables.find(t => t.id === 'tblVuCjVK2IGNaRd5');
    const modulesTable = base.tables.find(t => t.id === 'tblUv3DaZWnklWKSM');
    const certificatesTable = base.tables.find(t => t.id === 'tblCUzbfokZl7SPKe');
    const documentsTable = base.tables.find(t => t.id === 'tblZYK2LJurxP9A6t');
    const badgesTable = base.tables.find(t => t.id === 'tblhxWj02cuttDpMS');

    return [
        { key: 'staffTable', label: 'Staff', type: 'table' as const, defaultValue: staffTable },
        { key: 'familiesTable', label: 'Families', type: 'table' as const, defaultValue: familiesTable },
        { key: 'caseTasksTable', label: 'Case tasks', type: 'table' as const, defaultValue: caseTasksTable },
        { key: 'applicantsTable', label: 'Applicants', type: 'table' as const, defaultValue: applicantsTable },
        { key: 'requirementsTable', label: 'Requirements', type: 'table' as const, defaultValue: requirementsTable },
        { key: 'modulesTable', label: 'Modules', type: 'table' as const, defaultValue: modulesTable },
        { key: 'certificatesTable', label: 'Certificates', type: 'table' as const, defaultValue: certificatesTable },
        { key: 'documentsTable', label: 'Documents', type: 'table' as const, defaultValue: documentsTable },
        { key: 'badgesTable', label: 'Badges', type: 'table' as const, defaultValue: badgesTable },
    ];
}

interface HousePosition {
    x: number;
    y: number;
    color: string;
    roofColor: string;
}

const HOUSE_COLORS = [
    { base: '#FEF3E2', roof: '#E8B4B4' },
    { base: '#E8F4E5', roof: '#A8C5A0' },
    { base: '#E5EEF5', roof: '#8FAACD' },
    { base: '#FEF0E5', roof: '#D4A57B' },
    { base: '#F5E8F0', roof: '#C49BB8' },
    { base: '#F0F5E8', roof: '#B8C49B' },
    { base: '#E8F0F5', roof: '#9BB8C4' },
    { base: '#F5F0E8', roof: '#C4B89B' },
];

function generateHousePositions(familyIds: string[]): Map<string, HousePosition> {
    const positions = new Map<string, HousePosition>();
    const roadY = 200;
    const startX = 100;
    const spacing = 180;

    familyIds.forEach((id, index) => {
        const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const colorIndex = hash % HOUSE_COLORS.length;
        const colors = HOUSE_COLORS[colorIndex];
        const yOffset = (index % 2 === 0 ? -80 : 80) + ((hash % 20) - 10);

        positions.set(id, {
            x: startX + index * spacing,
            y: roadY + yOffset,
            color: colors?.base ?? '#FEF3E2',
            roofColor: colors?.roof ?? '#E8B4B4',
        });
    });

    return positions;
}

function House({
    position,
    label,
    progress,
    isSelected,
    onClick,
    onKeyDown,
    reducedMotion,
}: {
    position: HousePosition;
    label: string;
    progress: string;
    isSelected: boolean;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    reducedMotion: boolean;
}) {
    const [showFocusRing, setShowFocusRing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const scale = isHovered && !reducedMotion ? 1.08 : 1;

    return (
        <g
            transform={`translate(${position.x}, ${position.y})`}
            onClick={onClick}
            onKeyDown={onKeyDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={(e) => {
                let keyboardFocus = true;
                try {
                    keyboardFocus = e.currentTarget.matches(':focus-visible');
                } catch {
                }
                setShowFocusRing(keyboardFocus);
                setIsHovered(true);
            }}
            onBlur={() => {
                setShowFocusRing(false);
                setIsHovered(false);
            }}
            tabIndex={0}
            role="button"
            aria-label={`${label}, ${progress}`}
            className="cursor-pointer focus:outline-none"
            style={{ outline: 'none' }}
        >
            <g
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: '25px -10px',
                    transition: reducedMotion ? 'none' : 'transform 150ms ease-out',
                }}
            >
                {showFocusRing && (
                    <rect x="-22" y="-84" width="94" height="146" rx="8" fill="none" stroke="#2563EB" strokeWidth={2} strokeDasharray="5 3" />
                )}
                <polygon
                    points="0,-40 50,-40 50,20 0,20"
                    fill={position.color}
                    stroke="#D4C4B0"
                    strokeWidth={1}
                    className="transition-all duration-200"
                />
                <polygon
                    points="-10,-40 60,-40 25,-70"
                    fill={position.roofColor}
                    stroke="#C4A080"
                    strokeWidth={1}
                />
                <rect x="18" y="-10" width="14" height="30" fill="#8B7355" rx="1" />
                <rect x="5" y="-30" width="12" height="12" fill="#B8D4E8" stroke="#9BB8C4" strokeWidth="0.5" />
                <rect x="33" y="-30" width="12" height="12" fill="#B8D4E8" stroke="#9BB8C4" strokeWidth="0.5" />
                <rect x="-15" y="5" width="8" height="15" fill="#8B7355" />
                <rect x="-14" y="8" width="2" height="8" fill="#C4A080" />
                <ellipse cx="-5" cy="20" rx="8" ry="5" fill="#90B080" />
                <ellipse cx="55" cy="20" rx="8" ry="5" fill="#90B080" />
                <circle cx="-5" cy="12" r="2" fill="#FFB6C1" />
                <circle cx="55" cy="14" r="2" fill="#FFDAB9" />
                <text
                    x="25"
                    y="40"
                    textAnchor="middle"
                    className="text-xs font-medium fill-gray-700 dark:fill-gray-200"
                    style={{ fontSize: '10px' }}
                >
                    {label.length > 15 ? label.substring(0, 12) + '...' : label}
                </text>
                <text
                    x="25"
                    y="52"
                    textAnchor="middle"
                    className="text-xs fill-gray-500 dark:fill-gray-400"
                    style={{ fontSize: '8px' }}
                >
                    {progress}
                </text>
                {isSelected && (
                    <circle cx="25" cy="-75" r="5" fill="#2563EB" className="animate-pulse" />
                )}
            </g>
        </g>
    );
}

function Car({ x, y }: { x: number; y: number }) {
    return (
        <g transform={`translate(${x}, ${y})`}>
            <ellipse cx="15" cy="15" rx="20" ry="5" fill="rgba(0,0,0,0.1)" />
            <rect x="0" y="0" width="30" height="12" rx="2" fill="#E85D5D" />
            <rect x="3" y="-8" width="24" height="10" rx="3" fill="#E85D5D" />
            <rect x="5" y="-6" width="8" height="6" rx="1" fill="#B8D4E8" />
            <rect x="17" y="-6" width="8" height="6" rx="1" fill="#B8D4E8" />
            <circle cx="6" cy="14" r="4" fill="#333" />
            <circle cx="24" cy="14" r="4" fill="#333" />
            <circle cx="6" cy="14" r="2" fill="#666" />
            <circle cx="24" cy="14" r="2" fill="#666" />
        </g>
    );
}

function Road({ width }: { width: number }) {
    return (
        <g>
            <rect x="0" y="190" width={width} height="40" fill="#8B8B8B" />
            <line x1="0" y1="210" x2={width} y2="210" stroke="#FFFF00" strokeWidth="2" strokeDasharray="20,15" />
            <rect x="0" y="185" width={width} height="5" fill="#90B080" />
            <rect x="0" y="230" width={width} height="5" fill="#90B080" />
        </g>
    );
}

function InteractiveBush({
    x,
    y,
    reducedMotion,
}: {
    x: number;
    y: number;
    reducedMotion: boolean;
}) {
    const [petOut, setPetOut] = useState(false);
    const [petX, setPetX] = useState(0);
    const animationRef = useRef<number | null>(null);

    const triggerPet = useCallback(() => {
        if (petOut) return;
        setPetOut(true);
        setPetX(0);

        if (reducedMotion) {
            setPetX(35);
            setTimeout(() => {
                setPetOut(false);
                setPetX(0);
            }, 1200);
            return;
        }

        const startTime = performance.now();
        const runDuration = 400;
        const pauseDuration = 800;

        const animate = (now: number) => {
            const elapsed = now - startTime;
            if (elapsed < runDuration) {
                const progress = elapsed / runDuration;
                const eased = 1 - Math.pow(1 - progress, 2);
                setPetX(eased * 35);
                animationRef.current = requestAnimationFrame(animate);
            } else if (elapsed < runDuration + pauseDuration) {
                setPetX(35);
                animationRef.current = requestAnimationFrame(animate);
            } else if (elapsed < runDuration * 2 + pauseDuration) {
                const returnProgress = (elapsed - runDuration - pauseDuration) / runDuration;
                const eased = 1 - Math.pow(1 - returnProgress, 2);
                setPetX(35 - eased * 35);
                animationRef.current = requestAnimationFrame(animate);
            } else {
                setPetOut(false);
                setPetX(0);
                animationRef.current = null;
            }
        };

        animationRef.current = requestAnimationFrame(animate);
    }, [petOut, reducedMotion]);

    useEffect(() => {
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerPet();
        }
    };

    return (
        <g transform={`translate(${x}, ${y})`}>
            {petOut && (
                <g transform={`translate(${petX}, 0)`}>
                    <ellipse cx="8" cy="15" rx="6" ry="3" fill="rgba(0,0,0,0.1)" />
                    <ellipse cx="8" cy="8" rx="5" ry="4" fill="#D2691E" />
                    <circle cx="4" cy="5" r="3" fill="#D2691E" />
                    <circle cx="2" cy="3" r="1.5" fill="#8B4513" />
                    <circle cx="5" cy="3" r="1.5" fill="#8B4513" />
                    <ellipse cx="3.5" cy="5" rx="1" ry="0.5" fill="#333" />
                    <path d="M 13 8 Q 18 5 20 10" stroke="#D2691E" strokeWidth="2" fill="none" />
                    <rect x="3" y="12" width="2" height="4" rx="1" fill="#8B4513" />
                    <rect x="10" y="12" width="2" height="4" rx="1" fill="#8B4513" />
                </g>
            )}
            <g
                onClick={triggerPet}
                onKeyDown={handleKeyDown}
                tabIndex={0}
                role="button"
                aria-label="Click the bush for a surprise"
                className="cursor-pointer focus:outline-none"
                style={{ outline: 'none' }}
            >
                <ellipse cx="0" cy="10" rx="12" ry="8" fill="#5A8A4A" />
                <ellipse cx="-6" cy="6" rx="8" ry="6" fill="#6B9E5A" />
                <ellipse cx="6" cy="6" rx="8" ry="6" fill="#6B9E5A" />
                <circle cx="-4" cy="3" r="2" fill="#FF69B4" />
                <circle cx="5" cy="5" r="1.5" fill="#FFD700" />
            </g>
        </g>
    );
}

function Scenery({ width, reducedMotion }: { width: number; reducedMotion: boolean }) {
    const trees = useMemo(() => {
        const result = [];
        for (let i = 0; i < Math.floor(width / 300); i++) {
            result.push({ x: 50 + i * 300, y: 280 });
            result.push({ x: 200 + i * 300, y: 120 });
        }
        return result;
    }, [width]);

    const bushes = useMemo(() => {
        const result = [];
        for (let i = 0; i < Math.floor(width / 400); i++) {
            result.push({ x: 130 + i * 400, y: 170 });
        }
        return result;
    }, [width]);

    return (
        <g>
            {trees.map((tree, i) => (
                <g key={i} transform={`translate(${tree.x}, ${tree.y})`}>
                    <rect x="-3" y="0" width="6" height="20" fill="#8B7355" />
                    <ellipse cx="0" cy="-10" rx="15" ry="20" fill="#6B8E5A" />
                    <ellipse cx="-8" cy="-5" rx="10" ry="12" fill="#7BA05B" />
                    <ellipse cx="8" cy="-5" rx="10" ry="12" fill="#7BA05B" />
                </g>
            ))}
            {bushes.map((bush, i) => (
                <InteractiveBush key={`bush-${i}`} x={bush.x} y={bush.y} reducedMotion={reducedMotion} />
            ))}
        </g>
    );
}

function NeighborhoodMap({
    families,
    selectedFamilyId,
    onSelectFamily,
    taskProgressMap,
    reducedMotion,
}: {
    families: Array<{ id: string; label: string }>;
    selectedFamilyId: string | null;
    onSelectFamily: (id: string) => void;
    taskProgressMap: Map<string, { completed: number; total: number }>;
    reducedMotion: boolean;
}) {
    const [carPosition, setCarPosition] = useState({ x: 100, y: 200 });
    const carPositionRef = useRef(carPosition);
    const animationRef = useRef<number | null>(null);
    const targetRef = useRef<{ x: number; y: number } | null>(null);
    const mapScrollRef = useRef<HTMLDivElement | null>(null);
    const mapSvgRef = useRef<SVGSVGElement | null>(null);

    const housePositions = useMemo(
        () => generateHousePositions(families.map(f => f.id)),
        [families]
    );

    const mapWidth = Math.max(800, families.length * 180 + 200);

    const keepCarVisible = useCallback(() => {
        const container = mapScrollRef.current;
        const svg = mapSvgRef.current;
        if (!container || !svg) return;
        const matrix = svg.getScreenCTM();
        if (!matrix || container.clientWidth === 0) return;
        const point = svg.createSVGPoint();
        point.x = carPositionRef.current.x + 15;
        point.y = carPositionRef.current.y;
        const screenPoint = point.matrixTransform(matrix);
        const viewport = container.getBoundingClientRect();
        const desiredLeft = container.scrollLeft + screenPoint.x
            - viewport.left - container.clientLeft - container.clientWidth / 2;
        // Follow the existing car animation without starting a second scroll animation.
        // Reduced motion moves the car and viewport directly to the destination.
        container.scrollLeft = Math.max(0, Math.min(
            container.scrollWidth - container.clientWidth, desiredLeft,
        ));
    }, []);

    // Scroll along with the car on each frame of the drive.
    useEffect(() => {
        carPositionRef.current = carPosition;
        if (selectedFamilyId) keepCarVisible();
    }, [carPosition, selectedFamilyId, keepCarVisible]);

    // One resize watcher per selected house, instead of a new one on every animation frame.
    useEffect(() => {
        const container = mapScrollRef.current;
        const svg = mapSvgRef.current;
        if (!container || !svg || !selectedFamilyId) return;
        const observer = new ResizeObserver(() => keepCarVisible());
        observer.observe(container);
        observer.observe(svg);
        return () => observer.disconnect();
    }, [selectedFamilyId, keepCarVisible]);

    useEffect(() => {
        if (!selectedFamilyId) return;

        const targetHouse = housePositions.get(selectedFamilyId);
        if (!targetHouse) return;

        const target = { x: targetHouse.x + 10, y: 200 };
        targetRef.current = target;

        if (reducedMotion) {
            setCarPosition(target);
            return;
        }

        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        // Read the ref, not state, so this effect does not need carPosition as a dependency
        // (which would restart the drive on every animation frame).
        const startPos = { ...carPositionRef.current };
        const startTime = performance.now();
        const duration = 800;

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            const currentTarget = targetRef.current ?? target;

            setCarPosition({
                x: startPos.x + (currentTarget.x - startPos.x) * eased,
                y: startPos.y + (currentTarget.y - startPos.y) * eased,
            });

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                animationRef.current = null;
            }
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [selectedFamilyId, housePositions, reducedMotion]);

    const handleHouseClick = useCallback((id: string) => {
        onSelectFamily(id);
    }, [onSelectFamily]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent, id: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectFamily(id);
        }
    }, [onSelectFamily]);

    return (
        <div ref={mapScrollRef} className="relative w-full overflow-x-auto bg-gradient-to-b from-sky-100 to-green-50 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
            <svg
                ref={mapSvgRef}
                width={mapWidth}
                height={MAP_HEIGHT}
                viewBox={`0 0 ${mapWidth} ${MAP_HEIGHT}`}
                className="min-w-full"
            >
                <defs>
                    <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#87CEEB" />
                        <stop offset="100%" stopColor="#E8F5E9" />
                    </linearGradient>
                </defs>
                <rect width={mapWidth} height={MAP_HEIGHT} fill="url(#skyGradient)" className="dark:opacity-20" />
                <Scenery width={mapWidth} reducedMotion={reducedMotion} />
                <Road width={mapWidth} />
                {families.map(family => {
                    const pos = housePositions.get(family.id);
                    if (!pos) return null;
                    const progress = taskProgressMap.get(family.id);
                    const progressText = progress ? `$progress.completed/${progress.total}` : '0/0';
                    return (
                        <House
                            key={family.id}
                            position={pos}
                            label={family.label}
                            progress={progressText}
                            isSelected={selectedFamilyId === family.id}
                            onClick={() => handleHouseClick(family.id)}
                            onKeyDown={(e) => handleKeyDown(e, family.id)}
                            reducedMotion={reducedMotion}
                        />
                    );
                })}
                <Car x={carPosition.x} y={carPosition.y} />
            </svg>
        </div>
    );
}

function calendarDayInLosAngeles(date: Date): number {
    const parts = new Intl.DateTimeFormat('en-US', {timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit'}).formatToParts(date);
    const value = (type: string) => Number(parts.find(part => part.type === type)?.value);
    return Date.UTC(value('year'), value('month') - 1, value('day')) / 86400000;
}

function DeadlineLabel({ date, label, completed = false }: { date: Date | null; label: string; completed?: boolean }) {
    if (!date || !Number.isFinite(date.getTime())) {
        return <span className="text-gray-400 dark:text-gray-500 text-xs">No {label.toLowerCase()}</span>;
    }

    const now = new Date();
    const diffDays = calendarDayInLosAngeles(date) - calendarDayInLosAngeles(now);

    let statusText = '';
    let statusClass = '';

    if (completed) {
        statusText = 'Completed';
        statusClass = 'text-gray-500 dark:text-gray-400';
    } else if (diffDays < 0) {
        statusText = `$Math.abs(diffDays)day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`;
        statusClass = 'text-red-600 dark:text-red-400';
    } else if (diffDays === 0) {
        statusText = 'Due today';
        statusClass = 'text-orange-600 dark:text-orange-400';
    } else if (diffDays === 1) {
        statusText = '1 day left';
        statusClass = 'text-orange-500 dark:text-orange-400';
    } else {
        statusText = `${diffDays} days left`;
        statusClass = diffDays <= 7 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400';
    }

    const dateStr = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'America/Los_Angeles'
    });

    return (
        <div className="text-xs">
            <span className="text-gray-500 dark:text-gray-400">{label}: </span>
            <span className="text-gray-700 dark:text-gray-300">{dateStr}</span>
            <span className={`ml-1 ${statusClass}`}>({statusText})</span>
        </div>
    );
}

function TaskItem({
    task,
    documents,
    documentsTable,
    caseTasksTable,
    onTaskUpdate,
    reducedMotion,
}: {
    task: AirtableRecord;
    documents: AirtableRecord[];
    documentsTable: Table | null;
    caseTasksTable: Table | null;
    onTaskUpdate: () => void;
    reducedMotion: boolean;
}) {
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reward, setReward] = useState<string | null>(null);
    // Status the task had before this screen marked it complete, so unchecking puts it back.
    const previousStatusRef = useRef<string | null>(null);
    const toggleButtonRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (!reward) return;
        const timer = setTimeout(() => setReward(null), 2500);
        return () => clearTimeout(timer);
    }, [reward]);

    const nameField = caseTasksTable?.getFieldIfExists('fld5br7oTfBIoN3Wm');
    const statusField = caseTasksTable?.getFieldIfExists('fldSB3O0rvPi6iy4n');
    const doneField = caseTasksTable?.getFieldIfExists('fldhNZpoLxTe8MmpT');
    const completedAtField = caseTasksTable?.getFieldIfExists('fldOt53zMoDB7cMXg');
    const internalDueField = caseTasksTable?.getFieldIfExists('fldqCxrMLhZA7o2lu');
    const countyDueField = caseTasksTable?.getFieldIfExists('fldDiyFmnOOcoh562');
    const difficultyField = caseTasksTable?.getFieldIfExists('fld6efNQk4jh4YTQH');
    const whyItMattersField = caseTasksTable?.getFieldIfExists('fld5nvJFy4yz7stbB');
    const documentsLinkField = caseTasksTable?.getFieldIfExists('fldnPBXnPGIMFpGfV');
    const pointsField = caseTasksTable?.getFieldIfExists(TASK_POINTS_FIELD_ID);

    const isDone = doneField ? Boolean(task.getCellValue(doneField)) : false;
    const status = statusField ? (task.getCellValue(statusField) as { name: string } | null)?.name : null;
    const isComplete = isDone || status === 'Complete';
    const taskPoints = pointsField ? Number(task.getCellValue(pointsField) ?? 0) : 0;

    const internalDue = internalDueField ? task.getCellValue(internalDueField) as string | null : null;
    const countyDue = countyDueField ? task.getCellValue(countyDueField) as string | null : null;
    const difficulty = difficultyField ? (task.getCellValue(difficultyField) as { name: string } | null)?.name ?? '' : '';
    const whyItMatters = whyItMattersField ? String(task.getCellValue(whyItMattersField) ?? '') : '';

    const linkedDocs = documentsLinkField
        ? (task.getCellValue(documentsLinkField) as Array<{ id: string }> | null) ?? []
        : [];

    const taskDocuments = documents.filter(doc => linkedDocs.some(ld => ld.id === doc.id));

    // Small burst from the checkbox. Skipped when the viewer prefers reduced motion.
    const celebrateSavedTask = () => {
        if (reducedMotion) return;
        const rect = toggleButtonRef.current?.getBoundingClientRect();
        const origin = rect && window.innerWidth > 0 && window.innerHeight > 0
            ? { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight }
            : { y: 0.6 };
        confetti({ particleCount: 40, spread: 55, startVelocity: 25, origin });
    };

    const handleToggleComplete = async () => {
        if (!caseTasksTable || !doneField || !statusField || !completedAtField) {
            setError('Missing required fields');
            return;
        }

        if (!caseTasksTable.hasPermissionToUpdateRecords([{ id: task.id }])) {
            setError('No permission to update this task');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            if (isComplete) {
                setReward(null);
                // Put back the status from before completion; 'Open' when this screen didn't record one.
                const restoredStatus = previousStatusRef.current ?? 'Open';
                await caseTasksTable.updateRecordAsync(task.id, {
                    [doneField.id]: false,
                    [statusField.id]: { name: restoredStatus },
                    [completedAtField.id]: null,
                });
                previousStatusRef.current = null;
            } else {
                const statusBeforeComplete = status && status !== 'Complete' ? status : null;
                await caseTasksTable.updateRecordAsync(task.id, {
                    [doneField.id]: true,
                    [statusField.id]: { name: 'Complete' },
                    [completedAtField.id]: new Date().toISOString(),
                });
                // The save is confirmed at this point, so the reward matches what Airtable stored.
                previousStatusRef.current = statusBeforeComplete;
                setReward(taskPoints > 0 ? `+${taskPoints} points` : 'Saved');
                celebrateSavedTask();
            }
            onTaskUpdate();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to update task');
        } finally {
            setIsSaving(false);
        }
    };

    const [documentError, setDocumentError] = useState<string | null>(null);
    const handleOpenDocument = (doc: AirtableRecord) => {
        setDocumentError(null);
        try {
            if (!documentsTable?.hasPermissionToExpandRecords()) {
                setDocumentError('Document details are not enabled here. Ask the interface editor to enable record details for Documents.');
                return;
            }
            expandRecord(doc);
        } catch (e) {
            setDocumentError(e instanceof Error ? e.message : 'Unable to open document details.');
        }
    };

    const hasInconsistentState = isDone !== (status === 'Complete');

    return (
        <div className={`p-3 rounded-md border ${isComplete ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'} mb-2`}>
            <div className="flex items-start gap-3">
                <button
                    ref={toggleButtonRef}
                    onClick={handleToggleComplete}
                    disabled={isSaving}
                    className="mt-0.5 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                    aria-label={isComplete ? 'Mark as incomplete' : 'Mark as complete'}
                >
                    {isSaving ? (
                        <SpinnerIcon className="w-5 h-5 text-blue-500 animate-spin" />
                    ) : isComplete ? (
                        <CheckCircleIcon weight="fill" className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                        <CircleIcon className="w-5 h-5 text-gray-400 hover:text-blue-500" />
                    )}
                </button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        {nameField && (
                            <span className={`font-medium ${isComplete ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                <CellRenderer record={task} field={nameField} />
                            </span>
                        )}
                        {hasInconsistentState && (
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded">
                                Needs review
                            </span>
                        )}
                        {reward && (
                            <span role="status" className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded motion-safe:animate-pulse">
                                <StarIcon weight="fill" className="w-3 h-3" />
                                {reward}
                            </span>
                        )}
                    </div>
                    {status && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Status: {status}
                        </div>
                    )}
                    <div className="flex gap-4 mt-1 flex-wrap">
                        <DeadlineLabel date={internalDue ? new Date(internalDue) : null} label="Internal" completed={isComplete} />
                        <DeadlineLabel date={countyDue ? new Date(countyDue) : null} label="County" completed={isComplete} />
                    </div>
                    {(difficulty || whyItMatters) && (
                        <div className="flex gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {difficulty && <span>Difficulty: {difficulty}</span>}
                            {whyItMatters && <span className="italic">{whyItMatters}</span>}
                        </div>
                    )}
                    {taskDocuments.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {taskDocuments.map(doc => {
                                const docNameField = documentsTable?.getFieldIfExists('fldcLlPeCEesqkstz');
                                const pdfField = documentsTable?.getFieldIfExists('fldpNEyInIZKLNUNu');
                                const needsReviewField = documentsTable?.getFieldIfExists('fld82GncjeBJuxvVa');
                                const parsingStatusField = documentsTable?.getFieldIfExists('fldo1zuuvIeUpSmbm');

                                const attachments = pdfField ? doc.getCellValue(pdfField) as Array<{ filename: string }> | null : null;
                                const hasFile = attachments && attachments.length > 0;
                                const needsReview = needsReviewField ? Boolean(doc.getCellValue(needsReviewField)) : false;
                                const parsingStatus = parsingStatusField ? (doc.getCellValue(parsingStatusField) as { name: string } | null)?.name : null;

                                return (
                                    <div key={doc.id} className="flex items-center gap-2 text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded">
                                        <FileIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                        <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
                                            {docNameField ? String(doc.getCellValue(docNameField) ?? 'Unnamed document') : 'Document'}
                                        </span>
                                        <span className={`flex items-center gap-1 ${hasFile ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
                                            {hasFile ? <CheckCircleIcon weight="fill" className="w-3 h-3" /> : <WarningCircleIcon className="w-3 h-3" />}
                                            {hasFile ? 'File attached' : 'File needed'}
                                        </span>
                                        {needsReview && (
                                            <span className="text-yellow-600 dark:text-yellow-400">Review needed</span>
                                        )}
                                        {parsingStatus && (
                                            <span className="text-gray-500 dark:text-gray-400">{parsingStatus}</span>
                                        )}
                                        <span className="text-gray-500 dark:text-gray-400" title={attachments?.map(file => file.filename).join(', ')}>{attachments?.map(file => file.filename).join(', ')}</span>
                                        {documentsTable?.hasPermissionToExpandRecords() ? (
                                            <button
                                                onClick={() => handleOpenDocument(doc)}
                                                className="text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                Open document / add file
                                            </button>
                                        ) : (
                                            <span className="text-gray-500 dark:text-gray-400">Document details not enabled</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    {linkedDocs.length === 0 && (
                        <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                            No document linked
                        </div>
                    )}
                </div>
            </div>
            {documentError && <p role="alert" className="mt-2 text-xs text-red-600">{documentError}</p>}
            {error && (
                <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <WarningCircleIcon className="w-4 h-4" />
                    {error}
                    <button onClick={handleToggleComplete} className="underline ml-1">Retry</button>
                </div>
            )}
        </div>
    );
}

function ApplicantCard({
    applicant,
    requirements,
    modules,
    certificates,
    applicantsTable,
    requirementsTable,
    modulesTable,
    certificatesTable,
    onTrainingComplete,
    celebratedApplicants,
}: {
    applicant: AirtableRecord;
    requirements: AirtableRecord[];
    modules: AirtableRecord[];
    certificates: AirtableRecord[];
    applicantsTable: Table | null;
    requirementsTable: Table | null;
    modulesTable: Table | null;
    certificatesTable: Table | null;
    onTrainingComplete: (applicantId: string) => void;
    celebratedApplicants: Set<string>;
}) {
    const nameField = applicantsTable?.getFieldIfExists('fld5trzkv4kTnHPIn');
    const reqPeriodField = applicantsTable?.getFieldIfExists('fldLbhOsn3HEwJBWm');
    const modulesRequiredField = applicantsTable?.getFieldIfExists('fldxySeDwoW6sGUgd');
    const modulesCompletedField = applicantsTable?.getFieldIfExists('fldayyiXOp81rQ8nS');
    const requirementsLinkField = applicantsTable?.getFieldIfExists('fldzaAJbLNSceFAQm');
    const certsLinkField = applicantsTable?.getFieldIfExists('fldxwdl4IuYXDmUqf');

    const applicantName = nameField ? String(applicant.getCellValue(nameField) ?? 'Unknown') : 'Unknown';
    const reqPeriod = reqPeriodField ? String(applicant.getCellValue(reqPeriodField) ?? '') : '';
    const modulesRequired = modulesRequiredField ? Number(applicant.getCellValue(modulesRequiredField) ?? 0) : 0;
    const modulesCompleted = modulesCompletedField ? Number(applicant.getCellValue(modulesCompletedField) ?? 0) : 0;

    const linkedReqIds = requirementsLinkField
        ? (applicant.getCellValue(requirementsLinkField) as Array<{ id: string }> | null) ?? []
        : [];
    const linkedCertIds = certsLinkField
        ? (applicant.getCellValue(certsLinkField) as Array<{ id: string }> | null) ?? []
        : [];

    const applicantRequirements = requirements.filter(r => linkedReqIds.some(lr => lr.id === r.id));
    const applicantCertificates = certificates.filter(c => linkedCertIds.some(lc => lc.id === c.id));

    const reqModuleLinkField = requirementsTable?.getFieldIfExists('flduHDAeGCTSvj6cA');
    const completionResultField = requirementsTable?.getFieldIfExists('fldhIzOfeApDvEOpQ');
    const integrityWarningField = requirementsTable?.getFieldIfExists('fldIIGBE7aEXmXaJI');

    const moduleCodeField = modulesTable?.getFieldIfExists('fldDzgWhoMqfmYV9V');
    const moduleNameField = modulesTable?.getFieldIfExists('fldqmTTcEcTWgLAmU');
    const moduleSequenceField = modulesTable?.getFieldIfExists('fldtQnExC3aZfsT5q');

    const sortedRequirements = useMemo(() => {
        return [...applicantRequirements].sort((a, b) => {
            const aModuleLink = reqModuleLinkField ? (a.getCellValue(reqModuleLinkField) as Array<{ id: string }> | null)?.[0] : null;
            const bModuleLink = reqModuleLinkField ? (b.getCellValue(reqModuleLinkField) as Array<{ id: string }> | null)?.[0] : null;
            const aModule = aModuleLink ? modules.find(m => m.id === aModuleLink.id) : null;
            const bModule = bModuleLink ? modules.find(m => m.id === bModuleLink.id) : null;
            const aSeq = aModule && moduleSequenceField ? Number(aModule.getCellValue(moduleSequenceField) ?? 999) : 999;
            const bSeq = bModule && moduleSequenceField ? Number(bModule.getCellValue(moduleSequenceField) ?? 999) : 999;
            return aSeq - bSeq;
        });
    }, [applicantRequirements, modules, reqModuleLinkField, moduleSequenceField]);

    const isTrainingComplete = useMemo(() => {
        if (modulesRequired <= 0) return false;
        if (applicantRequirements.length === 0) return false;

        const moduleIds = new Set<string>();
        let allComplete = true;
        let allOK = true;
        let hasDuplicates = false;

        for (const req of applicantRequirements) {
            const moduleLink = reqModuleLinkField ? (req.getCellValue(reqModuleLinkField) as Array<{ id: string }> | null)?.[0] : null;
            if (!moduleLink) {
                allComplete = false;
                continue;
            }

            if (moduleIds.has(moduleLink.id)) {
                hasDuplicates = true;
            }
            moduleIds.add(moduleLink.id);

            const completionResult = completionResultField ? String(req.getCellValue(completionResultField) ?? '') : '';
            const integrityWarning = integrityWarningField ? String(req.getCellValue(integrityWarningField) ?? '') : '';

            if (completionResult !== 'Complete') {
                allComplete = false;
            }
            if (integrityWarning !== 'OK') {
                allOK = false;
            }
        }

        if (hasDuplicates) return false;
        if (moduleIds.size !== modulesRequired) return false;

        return allComplete && allOK;
    }, [applicantRequirements, modulesRequired, reqModuleLinkField, completionResultField, integrityWarningField]);

    // Celebrate only when training turns complete while this card is open,
    // not when the card opens on an applicant who was already complete.
    const wasTrainingCompleteRef = useRef<boolean | null>(null);
    useEffect(() => {
        const wasComplete = wasTrainingCompleteRef.current;
        wasTrainingCompleteRef.current = isTrainingComplete;
        if (wasComplete === false && isTrainingComplete && !celebratedApplicants.has(applicant.id)) {
            onTrainingComplete(applicant.id);
        }
    }, [isTrainingComplete, applicant.id, celebratedApplicants, onTrainingComplete]);

    const certPdfField = certificatesTable?.getFieldIfExists('fldi4zwJ2n5JxL5yP');
    const certReviewStatusField = certificatesTable?.getFieldIfExists('fldy51sV3dX5L8q7b');
    const certSubmittedAtField = certificatesTable?.getFieldIfExists('fldxkbdLgOrw1uBsv');

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">{applicantName}</h4>
                {isTrainingComplete && (
                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                        ✓ Tracked training complete
                    </span>
                )}
            </div>

            {reqPeriod && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Period: {reqPeriod}</p>
            )}

            <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Training Progress: {modulesCompleted}/{modulesRequired}
                </div>
                {modulesRequired <= 0 && (
                    <p className="text-xs text-orange-600 dark:text-orange-400">Required training count not configured</p>
                )}
            </div>

            <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Requirements</h5>
                {sortedRequirements.length === 0 ? (
                    <p className="text-xs text-orange-600 dark:text-orange-400">Requirements not configured</p>
                ) : (
                    <div className="space-y-1">
                        {sortedRequirements.map(req => {
                            const moduleLink = reqModuleLinkField ? (req.getCellValue(reqModuleLinkField) as Array<{ id: string }> | null)?.[0] : null;
                            const module = moduleLink ? modules.find(m => m.id === moduleLink.id) : null;
                            const moduleName = module && moduleNameField ? String(module.getCellValue(moduleNameField) ?? 'Unknown') : 'Unknown module';
                            const moduleCode = module && moduleCodeField ? String(module.getCellValue(moduleCodeField) ?? '') : '';
                            const completionResult = completionResultField ? String(req.getCellValue(completionResultField) ?? '') : '';
                            const integrityWarning = integrityWarningField ? String(req.getCellValue(integrityWarningField) ?? '') : '';
                            const isComplete = completionResult === 'Complete';
                            // The Integrity Warning formula returns 'OK', 'Open', or 'ERROR: ...'. Only errors are problems;
                            // 'Open' is a normal unfinished requirement and already shows as an empty circle.
                            const hasIssue = integrityWarning.startsWith('ERROR');

                            return (
                                <div key={req.id} className="flex items-center gap-2 text-xs p-2 rounded bg-gray-50 dark:bg-gray-700">
                                    {isComplete ? (
                                        <CheckCircleIcon weight="fill" className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    ) : (
                                        <CircleIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    )}
                                    <span className="flex-1 text-gray-700 dark:text-gray-300">
                                        {moduleName}
                                        {moduleCode && <span className="text-gray-400 ml-1">({moduleCode})</span>}
                                    </span>
                                    {hasIssue && (
                                        <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                                            <WarningCircleIcon className="w-3 h-3" />
                                            {integrityWarning}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {applicantCertificates.length > 0 && (
                <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Certificates & Submissions</h5>
                    <div className="space-y-1">
                        {applicantCertificates.map(cert => {
                            const hasFile = certPdfField ? Boolean(cert.getCellValue(certPdfField)) : false;
                            const reviewStatus = certReviewStatusField ? (cert.getCellValue(certReviewStatusField) as { name: string } | null)?.name : null;
                            const submittedAt = certSubmittedAtField ? cert.getCellValue(certSubmittedAtField) as string | null : null;

                            return (
                                <div key={cert.id} className="flex items-center gap-2 text-xs p-2 rounded bg-gray-50 dark:bg-gray-700">
                                    <FileIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                    <span className={`${hasFile ? 'text-green-600 dark:text-green-400' : 'text-orange-500'}`}>
                                        {hasFile ? 'File attached' : 'No file'}
                                    </span>
                                    {reviewStatus && (
                                        <span className={`px-1.5 py-0.5 rounded ${
                                            reviewStatus === 'Approved' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                                            reviewStatus === 'Pending' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                                            'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                        }`}>
                                            {reviewStatus}
                                        </span>
                                    )}
                                    {submittedAt && (
                                        <span className="text-gray-500 dark:text-gray-400">
                                            Submitted: {new Date(submittedAt).toLocaleDateString()}
                                        </span>
                                    )}
                                    {certificatesTable?.hasPermissionToExpandRecords() && (
                                        <button
                                            onClick={() => expandRecord(cert)}
                                            className="text-blue-600 dark:text-blue-400 hover:underline ml-auto"
                                        >
                                            View
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

function FamilyDetails({
    family,
    tasks,
    applicants,
    requirements,
    modules,
    certificates,
    documents,
    staffId,
    onClose,
    familiesTable,
    caseTasksTable,
    applicantsTable,
    requirementsTable,
    modulesTable,
    certificatesTable,
    documentsTable,
    onTaskUpdate,
    onTrainingComplete,
    celebratedApplicants,
    reducedMotion,
}: {
    family: AirtableRecord;
    tasks: AirtableRecord[];
    applicants: AirtableRecord[];
    requirements: AirtableRecord[];
    modules: AirtableRecord[];
    certificates: AirtableRecord[];
    documents: AirtableRecord[];
    staffId: string;
    onClose: () => void;
    familiesTable: Table | null;
    caseTasksTable: Table | null;
    applicantsTable: Table | null;
    requirementsTable: Table | null;
    modulesTable: Table | null;
    certificatesTable: Table | null;
    documentsTable: Table | null;
    onTaskUpdate: () => void;
    onTrainingComplete: (applicantId: string) => void;
    celebratedApplicants: Set<string>;
    reducedMotion: boolean;
}) {
    const householdLabelField = familiesTable?.getFieldIfExists('fldJD2sLLeqGxKXMI');
    const applicantsLinkField = familiesTable?.getFieldIfExists('fldBDCaOLMN8h53N6');
    const caseTasksLinkField = familiesTable?.getFieldIfExists('fldFTQqC2Q2XsGexc');

    const householdLabel = householdLabelField ? String(family.getCellValue(householdLabelField) ?? 'Unknown') : 'Unknown';

    const linkedApplicantIds = applicantsLinkField
        ? (family.getCellValue(applicantsLinkField) as Array<{ id: string }> | null) ?? []
        : [];
    const linkedTaskIds = caseTasksLinkField
        ? (family.getCellValue(caseTasksLinkField) as Array<{ id: string }> | null) ?? []
        : [];

    const assignedStaffField = caseTasksTable?.getFieldIfExists('fldVJi2CPGW3Npm61');

    const familyTasks = tasks.filter(t => {
        if (!linkedTaskIds.some(lt => lt.id === t.id)) return false;
        const assignedStaff = assignedStaffField ? (t.getCellValue(assignedStaffField) as Array<{ id: string }> | null) ?? [] : [];
        return assignedStaff.some(s => s.id === staffId);
    });

    const familyApplicants = applicants.filter(a => linkedApplicantIds.some(la => la.id === a.id));

    const doneField = caseTasksTable?.getFieldIfExists('fldhNZpoLxTe8MmpT');
    const statusField = caseTasksTable?.getFieldIfExists('fldSB3O0rvPi6iy4n');

    const completedCount = familyTasks.filter(t => {
        const isDone = doneField ? Boolean(t.getCellValue(doneField)) : false;
        const status = statusField ? (t.getCellValue(statusField) as { name: string } | null)?.name : null;
        return isDone || status === 'Complete';
    }).length;

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{householdLabel}</h2>
                <button
                    onClick={onClose}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Close details"
                >
                    <XIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <section>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <HouseIcon className="w-5 h-5" />
                        Household Work
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Your tasks for this household: {completedCount} / {familyTasks.length}
                    </p>
                    {familyTasks.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No tasks assigned to you for this household.</p>
                    ) : (
                        <div className="space-y-2">
                            {familyTasks.map(task => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    documents={documents}
                                    documentsTable={documentsTable}
                                    caseTasksTable={caseTasksTable}
                                    onTaskUpdate={onTaskUpdate}
                                    reducedMotion={reducedMotion}
                                />
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <UserIcon className="w-5 h-5" />
                        Applicants
                    </h3>
                    {familyApplicants.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No applicants linked to this household.</p>
                    ) : (
                        <div className="space-y-4">
                            {familyApplicants.map(applicant => (
                                <ApplicantCard
                                    key={applicant.id}
                                    applicant={applicant}
                                    requirements={requirements}
                                    modules={modules}
                                    certificates={certificates}
                                    applicantsTable={applicantsTable}
                                    requirementsTable={requirementsTable}
                                    modulesTable={modulesTable}
                                    certificatesTable={certificatesTable}
                                    onTrainingComplete={onTrainingComplete}
                                    celebratedApplicants={celebratedApplicants}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

function MyProgress({
    staff,
    badges,
    staffTable,
    badgesTable,
}: {
    staff: AirtableRecord | null;
    badges: AirtableRecord[];
    staffTable: Table | null;
    badgesTable: Table | null;
}) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!staff) return null;

    const nameField = staffTable?.getFieldIfExists('flduNDpRAl2R9aaXR');
    const photoField = staffTable?.getFieldIfExists('fldRoMDZjUCTFkM07');
    const pointsEarnedField = staffTable?.getFieldIfExists('fldWZqV2x7VwnNpwO');
    const badgeBonusField = staffTable?.getFieldIfExists('fldYFntcUtD8s2C4N');
    const totalScoreField = staffTable?.getFieldIfExists('fldJ1J9oWadcB0qpR');
    const pointsGoalField = staffTable?.getFieldIfExists('fldH4WFT5iNDAAeko');
    const levelField = staffTable?.getFieldIfExists('fldVSaRGti2ogQwqV');
    const badgesLinkField = staffTable?.getFieldIfExists('fldhMps6x5lDOGyvV');

    const staffName = nameField ? String(staff.getCellValue(nameField) ?? 'Unknown') : 'Unknown';
    const photo = photoField ? staff.getCellValue(photoField) as Array<{ url: string; thumbnails?: { small?: { url: string } } }> | null : null;
    const photoUrl = photo?.[0]?.thumbnails?.small?.url ?? photo?.[0]?.url;
    const pointsEarned = pointsEarnedField ? Number(staff.getCellValue(pointsEarnedField) ?? 0) : 0;
    const badgeBonus = badgeBonusField ? Number(staff.getCellValue(badgeBonusField) ?? 0) : 0;
    const totalScore = totalScoreField ? Number(staff.getCellValue(totalScoreField) ?? 0) : 0;
    const pointsGoal = pointsGoalField ? Number(staff.getCellValue(pointsGoalField) ?? 0) : 0;
    const level = levelField ? String(staff.getCellValue(levelField) ?? '') : '';

    const linkedBadgeIds = badgesLinkField
        ? (staff.getCellValue(badgesLinkField) as Array<{ id: string }> | null) ?? []
        : [];

    const badgeNameField = badgesTable?.getFieldIfExists('fldMgKrM6SJyPzBEr');
    const whatItTakesField = badgesTable?.getFieldIfExists('fldNL7dioXR2V6S1r');
    const activeField = badgesTable?.getFieldIfExists('flddm7wTDReUXtlem');
    const categoryField = badgesTable?.getFieldIfExists('fldlXYKCGAjx8tP44');

    const staffBadges = badges.filter(b => {
        if (!linkedBadgeIds.some(lb => lb.id === b.id)) return false;
        const isActive = activeField ? Boolean(b.getCellValue(activeField)) : true;
        return isActive;
    });

    const progressPercent = pointsGoal > 0 ? Math.max(0, Math.min(100, (totalScore / pointsGoal) * 100)) : 0;

    const categoryColors: Record<string, string> = {
        'Speed': 'bg-blue-500',
        'Accuracy': 'bg-green-500',
        'Family Care': 'bg-pink-500',
        'Teamwork': 'bg-purple-500',
        'Milestone': 'bg-yellow-500',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
                <div className="flex items-center gap-2">
                    <TrophyIcon className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">My Progress</span>
                </div>
                {isExpanded ? (
                    <CaretUpIcon className="w-4 h-4 text-gray-500" />
                ) : (
                    <CaretDownIcon className="w-4 h-4 text-gray-500" />
                )}
            </button>

            {isExpanded && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="flex items-center gap-3">
                        {photoUrl ? (
                            <img src={photoUrl} alt={staffName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-gray-500" />
                            </div>
                        )}
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{staffName}</p>
                            {level && <p className="text-sm text-gray-500 dark:text-gray-400">{level}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{totalScore}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Score</p>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{pointsEarned}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Points</p>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{badgeBonus}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Badge Bonus</p>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 dark:text-gray-400">Personal goal · Total Score</span>
                            <span className="text-gray-900 dark:text-gray-100">
                                {pointsGoal > 0 ? `${totalScore} / ${pointsGoal}` : 'No points goal set'}
                            </span>
                        </div>
                        {pointsGoal > 0 && (
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        )}
                        {pointsGoal > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{Math.round((totalScore / pointsGoal) * 100)}% of your goal · task points plus existing badge bonus</p>
                        )}
                    </div>

                    {staffBadges.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Badges Earned</p>
                            <div className="flex flex-wrap gap-2">
                                {staffBadges.map(badge => {
                                    const badgeName = badgeNameField ? String(badge.getCellValue(badgeNameField) ?? '') : '';
                                    const whatItTakes = whatItTakesField ? String(badge.getCellValue(whatItTakesField) ?? '') : '';
                                    const category = categoryField ? (badge.getCellValue(categoryField) as { name: string } | null)?.name : '';
                                    const colorClass = category ? categoryColors[category] ?? 'bg-gray-500' : 'bg-gray-500';

                                    return (
                                        <div
                                            key={badge.id}
                                            className="group relative"
                                            title={whatItTakes}
                                        >
                                            <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-white shadow-md hover:scale-110 transition-transform`}>
                                                <StarIcon weight="fill" className="w-5 h-5" />
                                            </div>
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                {badgeName}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function FamilyNeighborhood() {
    const { customPropertyValueByKey, errorState } = useCustomProperties(getCustomProperties);

    const staffTable = customPropertyValueByKey.staffTable as Table | undefined;
    const familiesTable = customPropertyValueByKey.familiesTable as Table | undefined;
    const caseTasksTable = customPropertyValueByKey.caseTasksTable as Table | undefined;
    const applicantsTable = customPropertyValueByKey.applicantsTable as Table | undefined;
    const requirementsTable = customPropertyValueByKey.requirementsTable as Table | undefined;
    const modulesTable = customPropertyValueByKey.modulesTable as Table | undefined;
    const certificatesTable = customPropertyValueByKey.certificatesTable as Table | undefined;
    const documentsTable = customPropertyValueByKey.documentsTable as Table | undefined;
    const badgesTable = customPropertyValueByKey.badgesTable as Table | undefined;

    const staffRecords = useRecords(staffTable ?? null) ?? NO_RECORDS;
    const familyRecords = useRecords(familiesTable ?? null) ?? NO_RECORDS;
    const taskRecords = useRecords(caseTasksTable ?? null) ?? NO_RECORDS;
    const applicantRecords = useRecords(applicantsTable ?? null) ?? NO_RECORDS;
    const requirementRecords = useRecords(requirementsTable ?? null) ?? NO_RECORDS;
    const moduleRecords = useRecords(modulesTable ?? null) ?? NO_RECORDS;
    const certificateRecords = useRecords(certificatesTable ?? null) ?? NO_RECORDS;
    const documentRecords = useRecords(documentsTable ?? null) ?? NO_RECORDS;
    const badgeRecords = useRecords(badgesTable ?? null) ?? NO_RECORDS;

    const [selectedStaffId, setSelectedStaffId] = useState<string>(DEFAULT_STAFF_RECORD_ID);
    const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [celebratedApplicants, setCelebratedApplicants] = useState<Set<string>>(new Set());
    const [taskUpdateTrigger, setTaskUpdateTrigger] = useState(0);

    const reducedMotion = useMemo(() => {
        if (typeof window !== 'undefined') {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
        return false;
    }, []);

    const activeStaff = useMemo(() => {
        const activeField = staffTable?.getFieldIfExists('fldKujGVyat1jJQ9T');
        return staffRecords.filter(s => {
            const isActive = activeField ? Boolean(s.getCellValue(activeField)) : true;
            return isActive;
        });
    }, [staffRecords, staffTable]);

    const selectedStaff = useMemo(() => {
        let staff = staffRecords.find(s => s.id === selectedStaffId);
        if (!staff && staffRecords.length > 0) {
            staff = staffRecords.find(s => s.id === DEFAULT_STAFF_RECORD_ID) ?? staffRecords[0];
        }
        return staff ?? null;
    }, [staffRecords, selectedStaffId]);

    useEffect(() => {
        if (selectedStaff && selectedStaffId !== selectedStaff.id) {
            setSelectedStaffId(selectedStaff.id);
        }
    }, [selectedStaff]);

    const staffFamilies = useMemo(() => {
        if (!selectedStaff || !caseTasksTable) return [];

        const caseTasksField = staffTable?.getFieldIfExists('fldtss3huBAeIdWwP');
        const applicationField = caseTasksTable?.getFieldIfExists('fldUvN2fAIuYvmjPD');
        const householdLabelField = familiesTable?.getFieldIfExists('fldJD2sLLeqGxKXMI');

        if (!caseTasksField || !applicationField) return [];

        const linkedTaskIds = (selectedStaff.getCellValue(caseTasksField) as Array<{ id: string }> | null) ?? [];
        const familyIds = new Set<string>();

        linkedTaskIds.forEach(taskLink => {
            const task = taskRecords.find(t => t.id === taskLink.id);
            if (task) {
                const appLinks = (task.getCellValue(applicationField) as Array<{ id: string }> | null) ?? [];
                appLinks.forEach(appLink => familyIds.add(appLink.id));
            }
        });

        return Array.from(familyIds)
            .map(id => {
                const family = familyRecords.find(f => f.id === id);
                if (!family) return null;
                const label = householdLabelField ? String(family.getCellValue(householdLabelField) ?? 'Unknown') : 'Unknown';
                return { id, label };
            })
            .filter((f): f is { id: string; label: string } => f !== null)
            .sort((a, b) => a.id.localeCompare(b.id));
    }, [selectedStaff, taskRecords, familyRecords, staffTable, caseTasksTable, familiesTable]);

    const filteredFamilies = useMemo(() => {
        if (!searchQuery.trim()) return staffFamilies;
        const query = searchQuery.toLowerCase();
        return staffFamilies.filter(f => f.label.toLowerCase().includes(query));
    }, [staffFamilies, searchQuery]);

    const taskProgressMap = useMemo(() => {
        const map = new Map<string, { completed: number; total: number }>();
        const applicationField = caseTasksTable?.getFieldIfExists('fldUvN2fAIuYvmjPD');
        const assignedStaffField = caseTasksTable?.getFieldIfExists('fldVJi2CPGW3Npm61');
        const doneField = caseTasksTable?.getFieldIfExists('fldhNZpoLxTe8MmpT');
        const statusField = caseTasksTable?.getFieldIfExists('fldSB3O0rvPi6iy4n');

        if (!applicationField || !assignedStaffField || !selectedStaff) return map;

        staffFamilies.forEach(family => {
            const familyTasks = taskRecords.filter(t => {
                const appLinks = (t.getCellValue(applicationField) as Array<{ id: string }> | null) ?? [];
                const staffLinks = (t.getCellValue(assignedStaffField) as Array<{ id: string }> | null) ?? [];
                return appLinks.some(a => a.id === family.id) && staffLinks.some(s => s.id === selectedStaff.id);
            });

            const completed = familyTasks.filter(t => {
                const isDone = doneField ? Boolean(t.getCellValue(doneField)) : false;
                const status = statusField ? (t.getCellValue(statusField) as { name: string } | null)?.name : null;
                return isDone || status === 'Complete';
            }).length;

            map.set(family.id, { completed, total: familyTasks.length });
        });

        return map;
    }, [staffFamilies, taskRecords, caseTasksTable, selectedStaff, taskUpdateTrigger]);

    const selectedFamily = useMemo(() => {
        if (!selectedFamilyId) return null;
        return staffFamilies.some(f => f.id === selectedFamilyId) ? familyRecords.find(f => f.id === selectedFamilyId) ?? null : null;
    }, [selectedFamilyId, familyRecords, staffFamilies]);

    const familyIndex = useMemo(() => {
        if (!selectedFamilyId) return -1;
        return staffFamilies.findIndex(f => f.id === selectedFamilyId);
    }, [selectedFamilyId, staffFamilies]);

    const handlePrevious = useCallback(() => {
        if (familyIndex > 0) {
            const prevFamily = staffFamilies[familyIndex - 1];
            if (prevFamily) setSelectedFamilyId(prevFamily.id);
        }
    }, [familyIndex, staffFamilies]);

    const handleNext = useCallback(() => {
        if (familyIndex < staffFamilies.length - 1) {
            const nextFamily = staffFamilies[familyIndex + 1];
            if (nextFamily) setSelectedFamilyId(nextFamily.id);
        }
    }, [familyIndex, staffFamilies]);

    const handleTrainingComplete = useCallback((applicantId: string) => {
        if (celebratedApplicants.has(applicantId)) return;

        setCelebratedApplicants(prev => new Set([...prev, applicantId]));

        if (!reducedMotion) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [celebratedApplicants, reducedMotion]);

    const handleTaskUpdate = useCallback(() => {
        setTaskUpdateTrigger(prev => prev + 1);
    }, []);

    useEffect(() => {
        setSelectedFamilyId(null);
        setSearchQuery('');
        setCelebratedApplicants(new Set());
    }, [selectedStaffId]);

    if (errorState) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-md text-center">
                    <WarningCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Configuration Error</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Please configure the required tables in the properties panel.
                    </p>
                </div>
            </div>
        );
    }

    if (!staffTable || !familiesTable || !caseTasksTable) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-md text-center">
                    <SpinnerIcon className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Loading...</h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        Setting up the neighborhood...
                    </p>
                </div>
            </div>
        );
    }

    const staffNameField = staffTable.getFieldIfExists('flduNDpRAl2R9aaXR');
    const staffPhotoField = staffTable.getFieldIfExists('fldRoMDZjUCTFkM07');

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="flex h-screen">
                <div className={`flex-1 flex flex-col ${selectedFamily ? 'w-1/2' : 'w-full'} transition-all duration-300`}>
                    <header className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-3">
                                <label htmlFor="staff-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Staff:
                                </label>
                                <select
                                    id="staff-select"
                                    value={selectedStaffId}
                                    onChange={(e) => setSelectedStaffId(e.target.value)}
                                    className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {activeStaff.map(staff => {
                                        const name = staffNameField ? String(staff.getCellValue(staffNameField) ?? 'Unknown') : 'Unknown';
                                        return (
                                            <option key={staff.id} value={staff.id}>{name}</option>
                                        );
                                    })}
                                </select>
                                {selectedStaff && staffPhotoField && (
                                    (() => {
                                        const photo = selectedStaff.getCellValue(staffPhotoField) as Array<{ url: string; thumbnails?: { small?: { url: string } } }> | null;
                                        const photoUrl = photo?.[0]?.thumbnails?.small?.url ?? photo?.[0]?.url;
                                        return photoUrl ? (
                                            <img src={photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                                        ) : null;
                                    })()
                                )}
                            </div>

                            <div className="flex-1 min-w-[200px] max-w-md">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="search"
                                        placeholder="Search families..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {selectedFamilyId && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handlePrevious}
                                        disabled={familyIndex <= 0}
                                        className="bg-white hover:bg-black/5 dark:bg-gray-600 dark:hover:bg-white/5 dark:text-white px-3 py-1.5 rounded-md shadow-xs hover:shadow-sm hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Previous house"
                                    >
                                        <CaretLeftIcon className="w-4 h-4" />
                                    </button>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {familyIndex + 1} / {staffFamilies.length}
                                    </span>
                                    <button
                                        onClick={handleNext}
                                        disabled={familyIndex >= staffFamilies.length - 1}
                                        className="bg-white hover:bg-black/5 dark:bg-gray-600 dark:hover:bg-white/5 dark:text-white px-3 py-1.5 rounded-md shadow-xs hover:shadow-sm hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        aria-label="Next house"
                                    >
                                        <CaretRightIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </header>

                    <main className="flex-1 overflow-auto p-4 space-y-4">
                        {staffFamilies.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <HouseIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No families assigned</h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {selectedStaff ? 'No families are linked through the case tasks available for this staff member. Choose another staff member, or check their assignments and the interface data settings.' : 'Select a staff member to view their caseload.'}
                                </p>
                            </div>
                        ) : (
                            <>
                                {filteredFamilies.length === 0 && <p role="status" className="text-sm text-gray-600 dark:text-gray-300">No families match this search. Clear the search to see the full caseload.</p>}
                                <NeighborhoodMap
                                    families={filteredFamilies}
                                    selectedFamilyId={selectedFamilyId}
                                    onSelectFamily={setSelectedFamilyId}
                                    taskProgressMap={taskProgressMap}
                                    reducedMotion={reducedMotion}
                                />

                                <div className="max-w-sm">
                                    <MyProgress
                                        staff={selectedStaff}
                                        badges={badgeRecords}
                                        staffTable={staffTable}
                                        badgesTable={badgesTable ?? null}
                                    />
                                </div>

                                {filteredFamilies.length > 8 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">All Families</h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                            {filteredFamilies.map(family => {
                                                const progress = taskProgressMap.get(family.id);
                                                return (
                                                    <button
                                                        key={family.id}
                                                        onClick={() => setSelectedFamilyId(family.id)}
                                                        className={`p-2 rounded text-left text-sm transition-colors ${
                                                            selectedFamilyId === family.id
                                                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                                                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                                                        }`}
                                                    >
                                                        <span className="block truncate font-medium">{family.label}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {progress ? `$progress.completed/${progress.total}` : '0/0'}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>

                {selectedFamily && selectedStaff && (
                    <div className="w-1/2 min-w-[400px] max-w-[600px] h-full">
                        <FamilyDetails
                            family={selectedFamily}
                            tasks={taskRecords}
                            applicants={applicantRecords}
                            requirements={requirementRecords}
                            modules={moduleRecords}
                            certificates={certificateRecords}
                            documents={documentRecords}
                            staffId={selectedStaff.id}
                            onClose={() => setSelectedFamilyId(null)}
                            familiesTable={familiesTable}
                            caseTasksTable={caseTasksTable}
                            applicantsTable={applicantsTable ?? null}
                            requirementsTable={requirementsTable ?? null}
                            modulesTable={modulesTable ?? null}
                            certificatesTable={certificatesTable ?? null}
                            documentsTable={documentsTable ?? null}
                            onTaskUpdate={handleTaskUpdate}
                            onTrainingComplete={handleTrainingComplete}
                            celebratedApplicants={celebratedApplicants}
                            reducedMotion={reducedMotion}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

initializeBlock({ interface: () => <FamilyNeighborhood /> });
