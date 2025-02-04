// app/admin/overview/date-range-picker.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, formatDateTime } from "@/lib/utils";
import { PopoverClose } from "@radix-ui/react-popover";
import { CalendarIcon } from "lucide-react";
import React from "react";
import { DateRange } from "react-day-picker";

export function CalendarDateRangePicker({
  defaultDate, // 기본 날짜 범위
  setDate, // 날짜 범위 설정 함수(overview-report.tsx에서 설정 및 전달)
  className, // 컴포넌트에 추가할 클래스
}: {
  defaultDate?: DateRange; // 기본 날짜 범위
  setDate: React.Dispatch<React.SetStateAction<DateRange | undefined>>; // 날짜 범위 설정 함수
  className?: string; // 컴포넌트에 추가할 클래스
}) {
  // 날짜 범위 선택 시 상태 관리
  const [calendarDate, setCalendarDate] = React.useState<DateRange | undefined>(defaultDate);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !calendarDate && "text-muted-foreground", // calendarDate가 없으면 텍스트 색상 변경
            )}>
            {/* 버튼 안에 아이콘, 메시지 표시 */}
            <CalendarIcon className="mr-0 h-4 w-4" />
            {/* 날짜의 처음과 끝이 있을 때는 <> 아래 텍스트를 표시 */}
            {calendarDate?.from ? (
              calendarDate.to ? (
                <>
                  {formatDateTime(calendarDate.from).dateOnly} - {formatDateTime(calendarDate.to).dateOnly}
                </>
              ) : (
                // 날짜의 처음만 있을 때는 처음 날짜만 표시
                formatDateTime(calendarDate?.from).dateOnly
              )
            ) : (
              // 날짜가 없을 때는 아래 텍스트 표시
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          // onCloseAuthFocus => Popover가 닫힐 때 calendarDate를 defaultDate로 초기화
          onCloseAutoFocus={() => setCalendarDate(defaultDate)}
          className="w-auto p-0"
          align="end">
          <Calendar
            mode="range"
            defaultMonth={defaultDate?.from}
            selected={calendarDate} // calendarDate를 선택된 날짜로 설정 > 시작점
            onSelect={setCalendarDate} // 선택된 날짜를 calendarDate로 설정 > 시작점, 끝점
            numberOfMonths={2} // 2개의 달력 표시
          />

          {/* APPLY, CANCEL BUTTONS */}
          <div className="flex gap-4 p-4 pt-0">
            <PopoverClose asChild>
              <Button onClick={() => setDate(calendarDate)}>Apply</Button>
            </PopoverClose>
            <PopoverClose asChild>
              <Button variant={"outline"}>Cancel</Button>
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
