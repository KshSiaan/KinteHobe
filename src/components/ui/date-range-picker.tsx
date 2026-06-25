"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type { DateRange };

type Props = {
	value?: DateRange;
	onChange?: (range: DateRange | undefined) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	fromDate?: Date;
};

export function DateRangePicker({
	value,
	onChange,
	placeholder = "Pick a date range",
	className,
	disabled,
	fromDate,
}: Props) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					disabled={disabled}
					className={cn(
						"w-full justify-start text-left font-normal",
						!value?.from && "text-muted-foreground",
						className,
					)}
				>
					<CalendarIcon className="mr-2 size-4 shrink-0" />
					{value?.from ? (
						value.to ? (
							<>
								{format(value.from, "LLL dd, y")} – {format(value.to, "LLL dd, y")}
							</>
						) : (
							format(value.from, "LLL dd, y")
						)
					) : (
						placeholder
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="range"
					defaultMonth={value?.from}
					selected={value}
					onSelect={onChange}
					numberOfMonths={2}
					disabled={{ before: fromDate ?? new Date() }}
				/>
			</PopoverContent>
		</Popover>
	);
}
