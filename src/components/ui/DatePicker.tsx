import { useState, useEffect, useRef } from "react";
import { format, isValid, parse, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfDay } from "date-fns";
import { enUS, he, ar } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";

interface DatePickerProps {
    value: Date;
    onChange: (date: Date) => void;
    minDate?: Date;
    maxDate?: Date;
    className?: string;
}

export default function DatePicker({ value, onChange, minDate, maxDate, className }: DatePickerProps) {
    const { i18n } = useTranslation();
    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date()); // For calendar navigation
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial sync
    useEffect(() => {
        if (isValid(value)) {
            setInputValue(format(value, "dd/MM/yyyy"));
            setViewDate(value);
        }
    }, [value]);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Revert to valid date if input is currently invalid/incomplete on blur
                if (isValid(value)) {
                    setInputValue(format(value, "dd/MM/yyyy"));
                    setError(null);
                }
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;

        // Allow only numbers and slashes
        if (!/^[\d/]*$/.test(val)) return;

        // Auto-masking: insert slash after 2nd and 5th chars if typing forward
        if (val.length === 2 && inputValue.length === 1) val += '/';
        if (val.length === 5 && inputValue.length === 4) val += '/';

        // Limit length
        if (val.length > 10) return;

        setInputValue(val);
        setError(null);

        // Attempt parse if complete
        if (val.length === 10) {
            const parsed = parse(val, "dd/MM/yyyy", new Date());
            if (isValid(parsed)) {
                // Check constraints
                if (minDate && isBefore(parsed, startOfDay(minDate))) {
                    setError("Date is in the past");
                    return;
                }
                // Success
                onChange(parsed);
                setViewDate(parsed);
            } else {
                setError("Invalid date");
            }
        }
    };

    const handleInputBlur = () => {
        if (inputValue.length === 10) {
            const parsed = parse(inputValue, "dd/MM/yyyy", new Date());
            if (!isValid(parsed) || parsed.getFullYear() < 1900) {
                setError("Invalid date");
                // Reset to current valid prop
                setInputValue(format(value, "dd/MM/yyyy"));
            } else if (minDate && isBefore(parsed, startOfDay(minDate))) {
                setError("Date cannot be in the past");
                setInputValue(format(value, "dd/MM/yyyy"));
            } else {
                onChange(parsed);
            }
        } else {
            // Incomplete, reset
            setInputValue(format(value, "dd/MM/yyyy"));
            setError(null);
        }
    };

    const getLocale = () => {
        switch (i18n.language) {
            case 'he': return he;
            case 'ar': return ar;
            default: return enUS;
        }
    };

    // Calendar Render Logic
    const getDays = () => {
        const start = startOfWeek(startOfMonth(viewDate), { weekStartsOn: 0 }); // Always Sun start for consistency
        const end = endOfWeek(endOfMonth(viewDate), { weekStartsOn: 0 });
        return eachDayOfInterval({ start, end });
    };

    const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    return (
        <div className={clsx("relative", className)} ref={containerRef}>
            <div className="relative group">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onClick={() => setIsOpen(true)}
                    placeholder="DD/MM/YYYY"
                    dir="ltr" // Force LTR for numbers
                    className={clsx(
                        "w-full p-4 pl-12 rounded-xl border bg-white outline-none transition-all font-medium text-lg shadow-sm placeholder:text-slate-300",
                        error ? "border-red-300 text-red-600 focus:ring-2 focus:ring-red-100" : "border-slate-200 text-slate-800 focus:ring-2 focus:ring-primary focus:border-primary"
                    )}
                />
                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
            </div>

            {error && (
                <div className="absolute -bottom-6 left-0 text-xs text-red-500 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} />
                    {error}
                </div>
            )}

            {isOpen && (
                <div className="absolute top-full left-0 z-50 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 w-[320px] animate-in fade-in zoom-in-95 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); setViewDate(subMonths(viewDate, 1)); }}
                            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <span className="font-bold text-slate-800">
                            {format(viewDate, "MMMM yyyy", { locale: getLocale() })}
                        </span>
                        <button
                            onClick={(e) => { e.stopPropagation(); setViewDate(addMonths(viewDate, 1)); }}
                            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    {/* Weekdays */}
                    <div className="grid grid-cols-7 mb-2 text-center">
                        {weekDays.map(d => (
                            <div key={d} className="text-xs font-bold text-slate-400 uppercase py-1">{d}</div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-1">
                        {getDays().map((day, i) => {
                            const isSelected = isSameDay(day, value);
                            const isCurrentMonth = isSameMonth(day, viewDate);
                            const isToday = isSameDay(day, new Date());
                            const isDisabled = (minDate && isBefore(day, startOfDay(minDate))) || (maxDate && isBefore(maxDate, day));

                            return (
                                <button
                                    key={i}
                                    disabled={!!isDisabled}
                                    onClick={() => {
                                        onChange(day);
                                        setInputValue(format(day, "dd/MM/yyyy"));
                                        setIsOpen(false);
                                        setError(null);
                                    }}
                                    className={clsx(
                                        "h-9 w-9 rounded-full flex items-center justify-center text-sm transition-all",
                                        !isCurrentMonth && "text-slate-300 opacity-50",
                                        isDisabled && "opacity-30 cursor-not-allowed",
                                        isSelected
                                            ? "bg-primary text-white font-bold shadow-md shadow-primary/20"
                                            : "hover:bg-slate-50 text-slate-700 font-medium",
                                        isToday && !isSelected && "bg-slate-100 text-primary font-bold"
                                    )}
                                >
                                    {format(day, "d")}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );

}
