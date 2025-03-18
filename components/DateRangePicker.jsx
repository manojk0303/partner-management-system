import { useState } from 'react';

const DateRangePicker = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  const formatDateForInput = (date) => {
    if (!date) return '';
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    return date.toISOString().split('T')[0];
  };

  const initialStart = formatDateForInput(startDate);
  const initialEnd = formatDateForInput(endDate);

  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [error, setError] = useState('');

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setStart(newStartDate);
    
    if (end && newStartDate > end) {
      setError('Start date cannot be after end date');
    } else {
      setError('');
      onStartDateChange(newStartDate);
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEnd(newEndDate);
    
    if (start && newEndDate < start) {
      setError('End date cannot be before start date');
    } else {
      setError('');
      onEndDateChange(newEndDate);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            value={start}
            onChange={handleStartDateChange}
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date (Optional)
          </label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            value={end}
            onChange={handleEndDateChange}
            min={start || new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default DateRangePicker;