export const getQueryBoards = (params: { limit: number, page: number }) => {
    return `{ boards(limit:${params.limit}, order_by:used_at, page:${params.page}) {
        id
        name
        type
        columns {
            id
            title
            type
        }
    }}`
};

export const getQueryBoardData = (params: { boardId: string }) => {
    return `{ boards(ids:${params.boardId}){
                id
                name
                columns {
                    id
                    title
                    type
                }
            }}`;
};

export const getQueryCreateColumn = (params: { boardId: string, title: string, type: string }) => {
    return `mutation{
                 create_column(board_id:${params.boardId}, title:"${params.title}", column_type:${params.type}){
                   id
            }}`;
};

export const getQueryProfile = (params: { boardId: string; key: string; data: string }) => {
    return `{items_by_column_values(board_id: ${params.boardId}, column_id: ${params.key}, column_value:"${params.data}"){
                id
                name
                column_values { id, text }
        }}`
};

export const getQueryCreateProfile = (params: { boardId: string, name: string, profileString: string }) => {
    return `mutation{
                create_item(board_id:${params.boardId}, item_name:"${params.name ?? '' }", column_values: "${params.profileString}"){
                    id
            }}`;
};

export const getQueryUpdateProfile = (params: { boardId: string, id: string, profileString: string }) => {
    return `mutation{
                change_multiple_column_values(item_id: ${params.id}, board_id:${params.boardId}, column_values: "${params.profileString}") { 
                   id
            }}`;
};
