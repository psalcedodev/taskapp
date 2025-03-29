import { GlassesIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface TableMainHeaderProps {
  title: string;
  canSearch: boolean;
  searchTerm: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  globalActions?: React.ReactNode;
}
export const TableMainHeader = ({ title, searchTerm, handleSearchChange, canSearch, globalActions }: TableMainHeaderProps) => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) && searchTerm === '') {
        setIsInputVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (isInputVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputVisible]);

  const toggleInputVisibility = () => {
    setIsInputVisible((prev) => !prev);
  };

  return (
    <div className="relative flex items-center justify-between gap-1 overflow-x-hidden rounded-t-md px-4 py-2">
      <div className="flex items-start space-x-5">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
      <div className="flex-grow" />
      {canSearch && (
        <div className="relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className={`h-8 rounded-md border border-gray-300 transition-all duration-300 ease-in-out ${
              isInputVisible || searchTerm ? 'w-48 pr-10 pl-4 opacity-100' : 'w-0 p-0 opacity-0'
            }`}
            autoFocus={isInputVisible || searchTerm !== ''}
            style={{ height: '30px' }}
          />
          <GlassesIcon className="absolute right-0 mr-2 h-5 w-5 cursor-pointer text-gray-500" onClick={toggleInputVisibility} />
        </div>
      )}
      {globalActions && (
        <div className="flex flex-col-reverse items-center justify-stretch space-y-4 space-y-reverse space-x-3 sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse">
          {globalActions}
        </div>
      )}
    </div>
  );
};
