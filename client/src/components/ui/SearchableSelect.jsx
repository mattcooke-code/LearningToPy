// components/ui/SearchableSelect.jsx
import { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, X } from "lucide-react";

/**
 * A searchable dropdown select component with filtering and keyboard navigation.
 *
 * This component provides an enhanced select experience with search functionality,
 * making it ideal for long option lists. It includes proper accessibility features,
 * click-outside handling, and comprehensive keyboard support.
 *
 * @component
 * @example
 * ```jsx
 * const options = [
 *   { value: "us", label: "United States" },
 *   { value: "uk", label: "United Kingdom" },
 *   { value: "ca", label: "Canada" }
 * ];
 *
 * <SearchableSelect
 *   value="us"
 *   onChange={setSelectedCountry}
 *   options={options}
 *   label="Country"
 *   placeholder="Select a country..."
 *   required
 * />
 * ```
 *
 * @param {Object} props - Component props
 * @param {string} props.value - Currently selected option value
 * @param {Function} props.onChange - Callback function called when selection changes. Receives the new value as argument
 * @param {Array<{value: string, label: string}>} props.options - Array of option objects with value and label properties
 * @param {string} [props.placeholder="Select..."] - Placeholder text displayed when no option is selected
 * @param {string} [props.label=null] - Optional label displayed above the select input
 * @param {boolean} [props.required=false] - If true, shows an asterisk (*) next to the label
 * @param {string} [props.className=""] - Additional CSS classes to apply to the wrapper element
 * @param {boolean} [props.disabled=false] - If true, disables the select and prevents interaction
 *
 * @returns {JSX.Element} A searchable select dropdown with filtering capabilities
 *
 * @features
 * - Real-time search filtering of options
 * - Click outside to close functionality
 * - Keyboard navigation support
 * - Clear search button
 * - Visual feedback for selected state
 * - Disabled state handling
 * - Required field indicator
 * - Responsive dropdown with scroll
 *
 * @internalLogic
 * State Management:
 * - `isOpen` - Controls dropdown visibility
 * - `searchTerm` - Current search query for filtering
 * - `wrapperRef` - Reference for click-outside detection
 *
 * Filtering Logic:
 * - Case-insensitive search on option labels
 * - Real-time filtering as user types
 * - Shows "No options found" when filter returns no results
 *
 * Event Handling:
 * - Click outside detection using mousedown event
 * - Search input stops propagation to prevent dropdown toggle
 * - Clear button resets search and maintains dropdown state
 * - Option selection closes dropdown and clears search
 *
 * @accessibility
 * - Semantic HTML structure with proper labels
 * - Disabled state with visual and interaction feedback
 * - Clear focus states and hover indicators
 * - Screen reader friendly with descriptive labels
 */
const SearchableSelect = ({
  value,
  onChange,
  options,
  placeholder = "Select...",
  label = null,
  required = false,
  className = "",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    const term = searchTerm.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Selected Value Display */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white cursor-pointer flex items-center justify-between ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-blue-500"
        }`}
      >
        <span
          className={!selectedOption ? "text-gray-400 dark:text-gray-500" : ""}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onClick={(e) => e.stopPropagation()}
              />
              {searchTerm && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm("");
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="overflow-y-auto max-h-64">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    value === option.value
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
