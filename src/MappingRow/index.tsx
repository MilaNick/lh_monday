import React, { useMemo } from 'react';

import { TMapItem, TMondayColumn } from '../App';
import SelectWithAutoComplete from '../SelectWithAutoComplete';
import { creatingColumnDataByColumnLh, findMappingColumnByLhId, notFalsy } from '../utils';

import './index.css';
interface IProps {
    lhOptions?: any
    map: TMapItem
    mondayOptions: TMondayColumn[]
    canAdd?: boolean
    canDelete?: boolean
    onSelect?: any
    onOverwriteChange?: any
    isIdentifier?: any
    onAddNewMap?: any
    onDeleteMap?: any
}

function MappingRow(props: Readonly<IProps>) {
    const {
        map,
        lhOptions,
        mondayOptions,
        canAdd,
        canDelete,
        onSelect,
        onOverwriteChange,
        isIdentifier,
        onAddNewMap,
        onDeleteMap,
    } = props;

    function mapLhOptions(lhOptions: any[] | undefined) {
        // @ts-ignore
        return lhOptions.map(option => ({ label: option.title, value: option.id }))
    }

    const optionsMonday = useMemo(() => {
        return [
            { label: 'Not selected', value: null },
            map.lh
            && creatingColumnDataByColumnLh[map.lh]
            && !findMappingColumnByLhId(mondayOptions, map.lh)
            && {
                label: creatingColumnDataByColumnLh[map.lh]?.title,
                value: 'create-column',
                color: 'green' as const,
            },
            ...mondayOptions.map(column => ({ label: column.title, value: column.id }))

        ].filter(notFalsy)
    }, [map.lh, mondayOptions]);

    return (
        <div className='mapping-fields'>
            <SelectWithAutoComplete
                className='mapping-fields__input'
                placeholder='Match the fields from Linked helper'
                options={mapLhOptions(lhOptions)}
                value={map.lh ?? ''}
                onSelect={value => onSelect('lh', value)}
            />
            <SelectWithAutoComplete
                className='mapping-fields__input'
                placeholder='Match the fields from Monday'
                options={optionsMonday}
                value={map.monday ?? ''}
                onSelect={value => onSelect('monday', value)}
                note={map.monday === 'create-column' ? (
                    <span className='note'>this column will be created</span>
                ) : undefined}
            />
            <div className="wrap-label">
                <label>
                    <input
                        onChange={(e) => isIdentifier(e.target.checked)}
                        type='checkbox'
                        className='custom-checkbox'
                        checked={map.identifier}
                    />
                    <span></span>
                </label>
                <div className='label'>Identifier</div>
            </div>
            <div className="wrap-label">
                <label>
                    <input
                        onChange={(e) => onOverwriteChange(e.target.checked)}
                        type='checkbox'
                        className='custom-checkbox'
                        checked={map.overwrite}
                    />
                    <span/>
                </label>
                <div className='label'>Overwrite</div>
            </div>
            {canDelete && (
                <button
                    className='btn close'
                    onClick={onDeleteMap}
                >x</button>
            )}
            {canAdd && (
                <button
                    className='btn close'
                    onClick={onAddNewMap}
                >+</button>
            )}
        </div>
    )
}

export default MappingRow;
