import axios from 'axios';

import { TMondayColumn } from './App';

export const fetchMonday = async (query: string, auth: string | null) => {
    return await axios.post('https://api.monday.com/v2',
        {
            query,
        }, {
            headers: {
                'Content-Type': 'application/json' as const,
                Authorization: auth,
            }
        })
};

export function findMappingColumnByLhId(columnsMonday: TMondayColumn[], columnLhId: string) {
    switch (columnLhId) {
        case 'member_id': {
            return columnsMonday.find(column => column.id.match(/linkedin_id\d*/))?.id;
        }
        case 'full_name': {
            return columnsMonday.find(column => column.id === 'name')?.id;
        }
        case 'email': {
            return columnsMonday.find(column => column.type === 'email')?.id;
        }
        case 'current_company': {
            return columnsMonday.find(column => column.id === 'text')?.id;
        }
        case 'phone' : {
            return columnsMonday.find(column => column.type === 'phone')?.id;
        }
    }
}

export const creatingColumnDataByColumnLh: Record<string, { title: string, type: string }> = {
    member_id: {
        title: 'LinkedIn id',
        type: 'text',
    }
};

export const notFalsy = <Value>(value: Value | null | undefined | false | 0 | ''): value is Value => {
    return value !== false && value !== undefined && value !== null && value !== 0 && value !== '';
};
