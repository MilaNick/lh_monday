import React from 'react';

import SelectWithAutoComplete from '../SelectWithAutoComplete';

import './index.css';

function Boards(props: any) {
    const {
        boards,
        boardId,
        setBoardId,
    } = props;

    function mapBoardsToOptions(boards: Array<{ name: string, id: string }>) {
        return boards.map(board => ({ label: board.name, value: board.id }))
    }

    return (
        <SelectWithAutoComplete
            placeholder='Choose a board'
            options={mapBoardsToOptions(boards)}
            value={boardId}
            onSelect={setBoardId}
        />
    )
}

export default Boards;
