import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isThursday, isWeekend, isBefore, startOfDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  bookedDates: Date[];
}

export function Calendar({ selectedDate, onSelectDate, bookedDates }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    const minDate = addDays(today, 1); // Minimum 24 hours in advance
    
    // Check if date is in the past or within 24 hours
    if (isBefore(date, minDate)) return true;
    
    // Check if it's Thursday (getDay() returns 4 for Thursday)
    if (isThursday(date)) return true;
    
    // Check if it's weekend
    if (isWeekend(date)) return true;
    
    // Check if date is fully booked (2 appointments)
    const bookingsOnDate = bookedDates.filter(bookedDate => 
      isSameDay(bookedDate, date)
    );
    
    return bookingsOnDate.length >= 2;
  };

  const isDateSelected = (date: Date) => {
    return selectedDate ? isSameDay(date, selectedDate) : false;
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  return (
    <Card className="shadow-card">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={previousMonth}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextMonth}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day labels */}
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}

            {/* Empty days */}
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} />
            ))}

            {/* Days */}
            {daysInMonth.map((day) => {
              const disabled = isDateDisabled(day);
              const selected = isDateSelected(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => !disabled && onSelectDate(day)}
                  disabled={disabled}
                  className={cn(
                    "aspect-square p-2 rounded-lg text-sm font-medium transition-all",
                    "hover:bg-accent hover:text-accent-foreground",
                    !isCurrentMonth && "text-muted-foreground/50",
                    disabled && "opacity-40 cursor-not-allowed hover:bg-transparent",
                    selected && "bg-gradient-primary text-primary-foreground hover:opacity-90",
                    !selected && !disabled && "hover:shadow-soft"
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="pt-4 border-t space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-primary" />
              <span className="text-muted-foreground">Data selecionada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted opacity-40" />
              <span className="text-muted-foreground">Indisponível</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
