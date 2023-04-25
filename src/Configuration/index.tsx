import React, { useState } from 'react';

import { TMapItem, TMondayColumn } from '../App';
import MappingRow from '../MappingRow';
import Popup from '../Popup';
import ProfileProcessing from '../ProfileProcessing';
import { getQueryCreateColumn } from '../queries';
import { fetchMonday, creatingColumnDataByColumnLh } from '../utils';

import './index.css'

export const someProfileLh_1 = {
    "full_name": "Priest",
    "first_name": "Maxi",
    "last_name": "Priest",
    "member_id": "340781111",
    "email": "maxi@gmail.com",
    "phone_1": '+79062289270',
    "current_company": "Mix 6",
    "profile_url": "https://www.linkedin.com/in/djordje-mikic-a7832a16a/",
    "avatar": "https://media.licdn.com/dms/image/C4D03AQHhWZs3zL1GRQ/profile-displayphoto-shrink_800_800/0/1625773386958?e=1680134400&v=beta&t=p0PR0yzB-b3IfOCr7MIpXRTiaH89z1a_z6as15_a5dA",
    "location_name": "Сербия",
    "address": "Сербия",
    "education_1": "tehnicka skola",
    "third_party_email_1": null,
    "organization_title_3": "Javascript Developer ",
    "organization_1": "Myorg",
    "language_1": "En",
    "website_1": "https://newportfolio-delta.vercel.app/",
    "followers": "148",
}
export const someProfileLh_2 = {
    "full_name": "Kuzmin Vlad",
    "first_name": "Vlad",
    "last_name": "Kuzmin",
    "member_id": "426571119",
    "email": "kuzmin@gmail.com",
    "phone_1": '+13255496792',
    "current_company": "Mylove",
    "profile_url": "https://www.linkedin.com/in/djordje-mikic-a7832a16a/",
    "avatar": "https://media.licdn.com/dms/image/C4D03AQHhWZs3zL1GRQ/profile-displayphoto-shrink_800_800/0/1625773386958?e=1680134400&v=beta&t=p0PR0yzB-b3IfOCr7MIpXRTiaH89z1a_z6as15_a5dA",
    "location_name": "Сербия",
    "address": "Сербия",
    "education_1": "tehnicka skola",
    "third_party_email_1": null,
    "organization_title_3": "Javascript Developer ",
    "organization_1": "Myorg",
    "language_1": "En",
    "website_1": "https://newportfolio-delta.vercel.app/",
    "followers": "148",
}
export const someProfileLh_3 = {
    "full_name": "Laura Omani",
    "first_name": "Laura",
    "last_name": "Omani",
    "member_id": "021111111",
    "email": "omani@gmail.com",
    "phone_1": '+2034228927',
    "current_company": "Axis",
    "profile_url": "https://www.linkedin.com/in/djordje-mikic-a7832a16a/",
    "avatar": "https://media.licdn.com/dms/image/C4D03AQHhWZs3zL1GRQ/profile-displayphoto-shrink_800_800/0/1625773386958?e=1680134400&v=beta&t=p0PR0yzB-b3IfOCr7MIpXRTiaH89z1a_z6as15_a5dA",
    "location_name": "Сербия",
    "address": "Сербия",
    "education_1": "tehnicka skola",
    "third_party_email_1": null,
    "organization_title_3": "Javascript Developer ",
    "organization_1": "Myorg",
    "language_1": "En",
    "website_1": "https://newportfolio-delta.vercel.app/",
    "followers": "148",
}

export const optionsLh = [
    {id: 'full_name'},
    {id: 'first_name'},
    {id: 'last_name'},
    {id: 'member_id'},
    {id: 'email'},
    {id: 'phone', withIndex: true},
    {id: 'current_company'},
    {id: 'profile_url'},
    {id: 'avatar'},
    {id: 'location_name'},
    {id: 'address'},
    {id: 'education', withIndex: true},
    {id: 'third_party_email', withIndex: true},
    {id: 'organization', withIndex: true},
    {id: 'language', withIndex: true},
    {id: 'website', withIndex: true},
    {id: 'followers'},
];

const queue = [someProfileLh_1, someProfileLh_2, someProfileLh_3]

interface IProps {
    auth: string
    boardId: string
    map: TMapItem[]
    optionsMonday: TMondayColumn[]
    refetchColumnsMonday: (boardId: string) => Promise<void>
    resetMap: (boardId: string) => void
    undoChanges: (boardId: string, columnsMonday: TMondayColumn[]) => void
    setMap: (map: TMapItem[] | null) => void
    saveMapToLS: (map: TMapItem[], boardId: string) => void
}

function Configuration(props: Readonly<IProps>) {
    const {
        auth,
        boardId,
        map,
        optionsMonday,
        refetchColumnsMonday,
        resetMap,
        undoChanges,
        saveMapToLS,
        setMap
    } = props;

    const [shown, setShown] = useState(false);
    const [shownReset, setShownReset] = useState(false);

    const onExitClick = () => {
        undoChanges(boardId, optionsMonday);
        setShown(false);
    };

    const onResetClick = () => {
        setShownReset(true);
    };

    const onSaveClick = async () => {
        const copiedMap = map.map((m) => ({ ...m }));
        let columnCreated = false;
        for await (const m of copiedMap) {
            if (m.monday === 'create-column') {
                if (!m.lh) {
                    throw new Error('The lh column does not exist');
                }
                const creatingColumnData = creatingColumnDataByColumnLh[m.lh];
                if (!creatingColumnData) {
                    throw new Error('The creating column data does not exist');
                }
                const createdColumnId = await createColumn(creatingColumnData.title, creatingColumnData.type);
                if (!createdColumnId) {
                    throw new Error('can\'t create a column');
                }
                m.monday = createdColumnId;
                columnCreated = true;
            }
        }
        if (columnCreated) {
            setMap(copiedMap);
            await refetchColumnsMonday(boardId);
        }
        saveMapToLS(copiedMap, boardId);
        setShown(false);
    }

    async function createColumn(title: string, type: string) {
        try {
            const query = getQueryCreateColumn({ boardId, title, type });
            const response = await fetchMonday(query, auth);
            return response.data.data.create_column?.id;
        } catch (e) {
            console.log('e', e);
        }
    }

    return (
        <>
            <div className="configuration-wrap">
                <button
                    className="button"
                    onClick={() => setShown(true)}
                    disabled={!boardId}
                > Edit configuration</button>
                <ProfileProcessing
                    auth={auth}
                    boardId={boardId}
                    map={map}
                    optionsMonday={optionsMonday}
                    queue={queue}
                />
            </div>
            <Popup shown={shown} setShown={setShown}>
                <span>The first  comparison are key. These boards will be used to search for a user on monday</span>
                {
                    map.map((rowMap, i) => {
                        return (
                            <MappingRow
                                key={String(rowMap.lh) + String(rowMap.monday) + i}
                                map={rowMap}
                                lhOptions={optionsLh}
                                mondayOptions={optionsMonday}
                                canAdd={true}
                                canDelete={map.length !== 1}
                                onSelect={(type: 'lh' | 'monday', columnId: string) => {
                                    if (type === 'lh' && rowMap.monday === 'create-column' && !(columnId in creatingColumnDataByColumnLh)) {
                                        rowMap.monday = null;
                                    }
                                    if (type === 'lh') {
                                        const selectedOption = optionsLh?.find(({ id }) => id === columnId);
                                        rowMap.index = selectedOption?.withIndex ? 1 : undefined;
                                    }
                                    rowMap[type] = columnId;
                                    setMap([...map]);
                                }}
                                onIndexChange={(index: number) => {
                                    rowMap.index = index;
                                    setMap([...map]);
                                }}
                                onOverwriteChange={(value: boolean) => {
                                    rowMap.overwrite = value;
                                    setMap([...map]);
                                }}
                                isIdentifier={(value: boolean) => {
                                    rowMap.identifier = value;
                                    setMap([...map]);
                                }}
                                onAddNewMap={() => {
                                    const newRowMap = { lh: null, monday: null, overwrite: false, identifier: false };
                                    setMap([...map.slice(0, i + 1), newRowMap, ...map.slice(i + 1)]);
                                }}
                                onDeleteMap={() => {
                                    setMap(map.filter((_, index) => index !== i));
                                }}
                            />
                        )})}
                <div className="button-wrap">
                    <button className="button" onClick={onExitClick}>Exit without saving</button>
                    <button className="button" onClick={onSaveClick}>Save</button>
                    <div className="button" onClick={onResetClick}>Reset</div>
                </div>
            </Popup>
            <Popup shown={shownReset} setShown={setShownReset}>
                <span>Are you really ready to delete all the mappings and go back to the original version?</span>
                <div className="button-wrap">
                    <button className="button" onClick={() => setShownReset(false)}>cancel</button>
                    <button className="button" onClick={() => {
                        resetMap(boardId);
                        setShownReset(false);
                    }}>confirm</button>
                </div>
            </Popup>
        </>
    )
}

export default Configuration;
