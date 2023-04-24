import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';

import Auth from './Auth';
import Boards from './Boards';
import Configuration from './Configuration';
import { getQueryBoardData, getQueryBoards } from './queries';
import { creatingColumnDataByColumnLh, fetchMonday, findMappingColumnByLhId } from './utils';

import './App.css';

export type TMapItem = { lh: string | null, monday: string | null, overwrite: boolean, identifier: boolean };
export type TMondayColumn = { id: string, title: string, type: 'date' | 'email' | 'link' | 'long-text' | 'multiple-person' | 'name' | 'numeric' | 'phone' | 'text' };
export const AuthContext = createContext<{ auth: string | null, setAuth: (auth: string | null) => void } | null>(null);

function App() {
    const [auth, setAuth] = useState(() => localStorage.getItem('tokenMonday'));
    const [boards, setBoards] = useState<any[]>([]);
    const [columnsMonday, setColumnsMonday] = useState<TMondayColumn[]>([]);
    const [boardId, setBoardId] = useState<string | null>(null);
    const [map, setMap] = useState<TMapItem[] | null>(null)

    const loadingBoards = useRef(false);

    const fetchBoards = useCallback(async (boards: any[] = [], page: number = 1): Promise<any[]> => {
        loadingBoards.current = true;
        const limit = 100;
        const query = getQueryBoards({limit, page});
        const response = (await fetchMonday(query, auth)).data.data.boards;
        if (response.length < limit) {
            return [...boards, ...response];
        }
        return await fetchBoards([...boards, ...response], page + 1)
    }, [auth])

    const fetchBoardData = useCallback(async (boardId: string) => {
        const query = getQueryBoardData({boardId});
        return (await fetchMonday(query, auth)).data.data.boards[0];
    }, [auth])

    const resetMap = useCallback((boardId: string) => {
        removeMapFromLS(boardId);
        setMap(createNewConfig(columnsMonday));
    }, [columnsMonday]);

    const setInitialMap = useCallback((boardId: string, responseColumnsMonday: TMondayColumn[]) => {
        const mapFromLS = readMapByBoardIdFromLS(boardId);
        if (mapFromLS) {
            setMap(checkColumnsAndFix(mapFromLS, responseColumnsMonday));
        } else {
            setMap(createNewConfig(responseColumnsMonday));
        }
    }, []);

    useEffect(() => {
        if (!auth || loadingBoards.current) {
            return;
        }
        (async () => {
            try {
                const boards = await fetchBoards();
                const filteredBoards: any[] = boards?.filter((board) => board.type === 'board');
                setBoards(filteredBoards)
            } catch (error) {
                console.log('error -->', error)
            } finally {
                loadingBoards.current = false;
            }
        })()
    }, [auth, fetchBoards]);

    useEffect(() => {
        if (!boardId) {
            return;
        }
        (async () => {
            try {
                const responseColumnsMonday = (await fetchBoardData(boardId)).columns;
                setColumnsMonday(responseColumnsMonday);
                setInitialMap(boardId, responseColumnsMonday);
            } catch (error) {
                console.error(`can't save map`, error);
            }
        })()
    }, [fetchBoardData, boardId, setInitialMap])

    function createNewConfig(columnsMonday: TMondayColumn[]): TMapItem[] {
        return [
            {
                lh: 'member_id',
                monday: findMappingColumnByLhId(columnsMonday, 'member_id') ?? 'create-column',
                overwrite: false,
                identifier: true
            },
            {lh: 'full_name', monday: findMappingColumnByLhId(columnsMonday, 'full_name') ?? null, overwrite: false, identifier: false},
            {lh: 'email', monday: findMappingColumnByLhId(columnsMonday, 'email') ?? null, overwrite: false, identifier: false},
            {lh: 'phone', monday: findMappingColumnByLhId(columnsMonday, 'phone') ?? null, overwrite: false, identifier: false},
            {
                lh: 'current_company',
                monday: findMappingColumnByLhId(columnsMonday, 'company') ?? null,
                overwrite: false,
                identifier: false
            },
            {lh: null, monday: null, overwrite: false, identifier: false},
        ]
    }

    async function refetchColumnsMonday(boardId: string) {
        const responseColumnsMonday = (await fetchBoardData(boardId)).columns;
        setColumnsMonday(responseColumnsMonday);
    }

    function checkColumnsAndFix(map: TMapItem[], columnsMonday: TMondayColumn[]) {
        const copiedMap = map.map((m) => ({...m}));
        copiedMap.forEach(m => {
            if (!columnsMonday.some(column => column.id === m.monday)) {
                m.monday = m.lh && creatingColumnDataByColumnLh[m.lh] ? 'create-column' : null;
            }
        })
        return copiedMap;
    }

    return (
            <AuthContext.Provider value={{auth, setAuth}}>
                <div className='wrap'>
                    <Auth/>
                    <Boards
                        boards={boards}
                        boardId={boardId}
                        setBoardId={setBoardId}
                    />
                    {boardId && map && auth && (
                        <Configuration
                            auth={auth}
                            boardId={boardId}
                            map={map}
                            optionsMonday={columnsMonday}
                            refetchColumnsMonday={refetchColumnsMonday}
                            resetMap={resetMap}
                            undoChanges={setInitialMap}
                            saveMapToLS={saveMapToLS}
                            setMap={setMap}
                        />
                    )}
                </div>

            </AuthContext.Provider>
    )
}

export default App;


function readMapByBoardIdFromLS(id: string) {
    const mapsFromLS = readMapsFromLS();
    if (mapsFromLS && id in mapsFromLS) {
        return mapsFromLS[id]
    }
}

function saveMapToLS(map: TMapItem[], boardId: string) {
    const mapsFromLS = readMapsFromLS();
    saveMapsToLS({...mapsFromLS, [boardId]: map});
}

function removeMapFromLS(boardId: string) {
    const mapsFromLS = readMapsFromLS();
    if (mapsFromLS && boardId in mapsFromLS) {
        delete mapsFromLS[boardId];
        saveMapsToLS(mapsFromLS);
    }
}

function saveMapsToLS(maps: { [boardId: string]: TMapItem[] }) {
    try {
        localStorage.setItem('mondayMapsByBoard', JSON.stringify(maps));
    } catch (error) {
        console.error('Got error while stringify maps');
    }
}

function readMapsFromLS() {
    const mapsFromLS = localStorage.getItem('mondayMapsByBoard');
    try {
        const parsedMaps: { [boardId: string]: TMapItem[] } | null = mapsFromLS ? JSON.parse(mapsFromLS) : null;
        return parsedMaps
    } catch (error) {
        console.error(`can't parse maps by board`, error);
    }
}
