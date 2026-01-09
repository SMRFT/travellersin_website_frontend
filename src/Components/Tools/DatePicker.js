import React, { useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaTimes } from 'react-icons/fa';

/* ================= STYLED COMPONENTS ================= */

const DatePickerWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const DateInput = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${props => props.$isOpen ? 'rgba(212, 175, 55, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(212, 175, 55, 0.3);
    background: rgba(255, 255, 255, 0.08);
  }

  ${props => props.$isOpen && css`
    background: rgba(255, 255, 255, 0.08);
  `}
`;

const CalendarIcon = styled.div`
  color: #d4af37;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
`;

const DateText = styled.div`
  flex: 1;
  color: ${props => props.$hasValue ? '#fff' : 'rgba(255, 255, 255, 0.4)'};
  font-size: 1rem;
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;

  &:hover {
    color: #d4af37;
  }
`;

/* --- Calendar Dropdown --- */
const CalendarDropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 1000;
  background: linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  min-width: 320px;

  @media (max-width: 400px) {
    min-width: 100%;
    right: 0;
  }
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 1rem;
  background: rgba(212, 175, 55, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const MonthYearDisplay = styled.div`
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  font-family: 'Playfair Display', Georgia, serif;
`;

const NavButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.15);
    border-color: rgba(212, 175, 55, 0.3);
    color: #d4af37;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

const WeekdaysRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 0.8rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const Weekday = styled.div`
  text-align: center;
  color: #d4af37;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 0.8rem 1rem 1rem;
  gap: 4px;
`;

const DayCell = styled.button`
  aspect-ratio: 1;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  ${props => props.$isToday && css`
    &::after {
      content: '';
      position: absolute;
      bottom: 4px;
      left: 50%;
      transform: translateX(-50%);
      width: 4px;
      height: 4px;
      background: #d4af37;
      border-radius: 50%;
    }
  `}

  ${props => {
        if (props.$disabled) {
            return css`
        background: transparent;
        color: rgba(255, 255, 255, 0.2);
        cursor: not-allowed;
      `;
        }
        if (props.$isSelected) {
            return css`
        background: linear-gradient(135deg, #d4af37, #b8860b);
        color: #0f0f1a;
        font-weight: 600;

        &::after {
          background: #0f0f1a;
        }
      `;
        }
        if (props.$isEmpty) {
            return css`
        background: transparent;
        cursor: default;
      `;
        }
        return css`
      background: rgba(255, 255, 255, 0.03);
      color: rgba(255, 255, 255, 0.8);

      &:hover {
        background: rgba(212, 175, 55, 0.15);
        color: #fff;
      }
    `;
    }}
`;

const QuickSelectSection = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
  flex-wrap: wrap;
`;

const QuickSelectButton = styled.button`
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.1);
    border-color: rgba(212, 175, 55, 0.3);
    color: #d4af37;
  }
`;

/* ================= DATE RANGE PICKER STYLES ================= */

const DateRangeContainer = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const DateRangeInput = styled.div`
  flex: 1;
`;

const DateRangeLabel = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

/* ================= HELPER FUNCTIONS ================= */

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const formatDate = (date, format = 'MMM DD, YYYY') => {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth();
    const year = d.getFullYear();

    return format
        .replace('YYYY', year)
        .replace('MMM', MONTHS[month].slice(0, 3))
        .replace('MM', String(month + 1).padStart(2, '0'))
        .replace('DD', String(day).padStart(2, '0'));
};

/* ================= SINGLE DATE PICKER COMPONENT ================= */

const DatePicker = ({
    value,
    onChange,
    placeholder = 'Select date',
    minDate = null,
    maxDate = null,
    disabled = false,
    showQuickSelect = true,
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (day) => {
        const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        onChange(selectedDate);
        setIsOpen(false);
    };

    const handleQuickSelect = (days) => {
        const date = new Date();
        date.setDate(date.getDate() + days);
        onChange(date);
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange(null);
    };

    const isDateDisabled = (day) => {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        if (minDate && date < new Date(minDate)) return true;
        if (maxDate && date > new Date(maxDate)) return true;
        return false;
    };

    const isToday = (day) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            viewDate.getMonth() === today.getMonth() &&
            viewDate.getFullYear() === today.getFullYear()
        );
    };

    const isSelected = (day) => {
        if (!value) return false;
        const selectedDate = new Date(value);
        return (
            day === selectedDate.getDate() &&
            viewDate.getMonth() === selectedDate.getMonth() &&
            viewDate.getFullYear() === selectedDate.getFullYear()
        );
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
        const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
        const days = [];

        // Empty cells before first day
        for (let i = 0; i < firstDay; i++) {
            days.push(<DayCell key={`empty-${i}`} $isEmpty disabled />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(
                <DayCell
                    key={day}
                    onClick={() => !isDateDisabled(day) && handleDateSelect(day)}
                    $isToday={isToday(day)}
                    $isSelected={isSelected(day)}
                    $disabled={isDateDisabled(day)}
                >
                    {day}
                </DayCell>
            );
        }

        return days;
    };

    return (
        <DatePickerWrapper ref={wrapperRef} {...props}>
            <InputWrapper>
                <DateInput
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    $isOpen={isOpen}
                >
                    <CalendarIcon>
                        <FaCalendarAlt />
                    </CalendarIcon>
                    <DateText $hasValue={!!value}>
                        {value ? formatDate(value) : placeholder}
                    </DateText>
                    {value && (
                        <ClearButton onClick={handleClear}>
                            <FaTimes />
                        </ClearButton>
                    )}
                </DateInput>
            </InputWrapper>

            <AnimatePresence>
                {isOpen && (
                    <CalendarDropdown
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <CalendarHeader>
                            <NavButton onClick={handlePrevMonth}>
                                <FaChevronLeft />
                            </NavButton>
                            <MonthYearDisplay>
                                {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                            </MonthYearDisplay>
                            <NavButton onClick={handleNextMonth}>
                                <FaChevronRight />
                            </NavButton>
                        </CalendarHeader>

                        <WeekdaysRow>
                            {WEEKDAYS.map(day => (
                                <Weekday key={day}>{day}</Weekday>
                            ))}
                        </WeekdaysRow>

                        <DaysGrid>
                            {renderCalendarDays()}
                        </DaysGrid>

                        {showQuickSelect && (
                            <QuickSelectSection>
                                <QuickSelectButton onClick={() => handleQuickSelect(0)}>
                                    Today
                                </QuickSelectButton>
                                <QuickSelectButton onClick={() => handleQuickSelect(1)}>
                                    Tomorrow
                                </QuickSelectButton>
                                <QuickSelectButton onClick={() => handleQuickSelect(7)}>
                                    In a week
                                </QuickSelectButton>
                            </QuickSelectSection>
                        )}
                    </CalendarDropdown>
                )}
            </AnimatePresence>
        </DatePickerWrapper>
    );
};

/* ================= DATE RANGE PICKER COMPONENT ================= */

export const DateRangePicker = ({
    startDate,
    endDate,
    onStartChange,
    onEndChange,
    startPlaceholder = 'Check-in',
    endPlaceholder = 'Check-out',
    ...props
}) => {
    return (
        <DateRangeContainer {...props}>
            <DateRangeInput>
                <DateRangeLabel>Check-in</DateRangeLabel>
                <DatePicker
                    value={startDate}
                    onChange={onStartChange}
                    placeholder={startPlaceholder}
                    minDate={new Date()}
                    maxDate={endDate}
                />
            </DateRangeInput>
            <DateRangeInput>
                <DateRangeLabel>Check-out</DateRangeLabel>
                <DatePicker
                    value={endDate}
                    onChange={onEndChange}
                    placeholder={endPlaceholder}
                    minDate={startDate || new Date()}
                />
            </DateRangeInput>
        </DateRangeContainer>
    );
};

export default DatePicker;
