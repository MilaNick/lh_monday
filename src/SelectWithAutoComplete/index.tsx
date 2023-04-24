import {ReactElement, useEffect, useMemo, useRef, useState} from 'react';

import './index.css';

interface IProps {
    placeholder: string
    options: Array<{ label: string, value: any, color?: 'green' }>
    value: any
    onSelect: (value: any) => void
    className?: string
    note?: ReactElement
}

function SelectWithAutoComplete(props: IProps) {
    const { placeholder = '', options = [], value = '', onSelect, className = '', note = null } = props;
    const selectedOption = options.find(option => option.value === value);
    const [searchValue, setSearchValue] = useState(selectedOption?.label ?? '');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [hasChanged, setHasChanged] = useState(false);
    const activeOption = useMemo(() => options.find(option => option.value === value), [options, value]);

    useEffect(() => {
        if (searchValue.length === 0) {
            setFilteredOptions(options);
        } else {
            setFilteredOptions(options.filter(option => option.label.toLowerCase().includes(searchValue.toLowerCase())));
        }
    }, [options, searchValue]);

    useEffect(() => {
        if (value) {
            setSearchValue(selectedOption?.label ?? '');
        }
    }, [selectedOption?.label, value])

    useEffect(() => {
        const handleClick = (e: any) => {
            if (!containerRef.current?.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [])

    return (
        <div className={`boards ${className}`} ref={containerRef}>
            {note}
            <input
                className='input input-search'
                type='text'
                placeholder={placeholder}
                onChange={(e) => {
                    const value = e.target.value;
                    setSearchValue(value);
                    setHasChanged(true);
                }}
                onClick={() => setFilteredOptions(options)}
                onFocus={e => {
                    e.target.select();
                    setIsOpen(true);
                    setHasChanged(false);
                }}
                onBlur={() => {
                    if (hasChanged && searchValue && activeOption) {
                        setSearchValue(activeOption.label);
                    } else if (hasChanged && !searchValue) {
                        onSelect(null);
                    }
                }}
                value={searchValue}
            />

            {isOpen && (
                <div className='autocomplete' >
                    {
                        filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <div
                                    className={
                                        'autocomplete__item ' + (option.color ? `autocomplete__item--${option.color} ` : '') + (option.value === value ? 'active' : '')
                                    }
                                    key={option.value}
                                    onClick={() => {
                                        onSelect(option.value);
                                        setIsOpen(false);
                                        setHasChanged(false);
                                    }}
                                >
                                    {option.label}
                                </div>
                            ))
                        ) : <div className='autocomplete__item autocomplete__item--no-options'>No options</div>
                    }
                </div>
            )}

        </div>)
}

export default SelectWithAutoComplete;
