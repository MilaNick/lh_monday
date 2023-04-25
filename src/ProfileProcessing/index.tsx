import parsePhoneNumber from 'libphonenumber-js';
import { TMapItem, TMondayColumn } from '../App';
import { getQueryCreateProfile, getQueryProfile, getQueryUpdateProfile } from '../queries';
import { fetchMonday } from '../utils';

interface IProps {
    auth: string
    boardId: string
    map: TMapItem[]
    optionsMonday: TMondayColumn[]
    queue: any[]
}

function ProfileProcessing(props: Readonly<IProps>) {
    const {
        auth,
        boardId,
        map,
        optionsMonday,
        queue,
    } = props;

    async function handleQueue() {
        for await (const profile of queue) {
            await processProfile(profile)
        }
    }

    async function processProfile(profileLh: any) {
        const originProfileMonday = await fetchProfilesMonday(profileLh);
        if (!originProfileMonday) {
            const profileM = map.filter(m => m.lh !== null && m.monday !== null).reduce((acc: any, item: any) => {
                const field = optionsMonday.find((list: any) => list.id === item.monday)!;
                const keyLh = item.index ? `${item.lh}_${item.index}` : item.lh;
                const value = convertValueForMonday(profileLh[keyLh], field.type);
                if (!value) {
                    return acc;
                }
                return { ...acc, [item.monday]: value };
            }, {})
            await createProfile(profileM);
        } else {
            const data: any[] = originProfileMonday.column_values;
            const profileMondayForSaved = map.filter(m => m.lh !== null && m.monday !== null).reduce((acc: {[key: string]: any }, rowMap) => {
                const columnMonday = optionsMonday.find((option: { id: string | null; }) => option.id === rowMap.monday);
                const dataOfColumn: { id: string, text: string } = data.find(d => d.id === rowMap.monday);
                const valueMonday = dataOfColumn?.text;
                const keyMonday = rowMap.monday;
                const keyLh = rowMap.index ? `${rowMap.lh}_${rowMap.index}` : rowMap.lh;
                if (!columnMonday || !keyMonday || !keyLh) {
                    return acc;
                }
                const value = (rowMap.overwrite || !valueMonday) ? convertValueForMonday(profileLh[keyLh], columnMonday.type) : null;
                if (!value) {
                    return acc;
                }
                return {...acc, [keyMonday]: value};
            }, {});
            profileMondayForSaved.id = originProfileMonday.id;
            if (Object.keys(profileMondayForSaved).length === 1) {
                return;
            }
            await updateProfile(profileMondayForSaved);
        }
    }


    function convertValueForMonday(value: string, type: string) {
        //TODO 'date', 'multiple-person'
        switch (type) {
            case 'date':
                return; // todo:реализовать дату
            case 'email':
                return {'email': value, 'text': value};
            case 'link':
                return {'url': value, 'text': value};
            case 'multiple-person':
                return;
            case 'phone':
                const phoneNumber = value ? parsePhoneNumber(value) : null;
                const countryShortName = phoneNumber?.isValid() ? phoneNumber.country : null;
                return {'phone': value, 'countryShortName': countryShortName};
            default:
                return value;
        }
    }

    async function fetchProfilesMonday(profileLh: any) {
        const inentifierFields = map.filter(m => m.identifier);
        for await (const inentifierField of inentifierFields) {
            const keyLh = inentifierField?.lh as keyof typeof profileLh | undefined;
            const keyMonday = inentifierField?.monday;
            const searchData: string | undefined = keyLh && keyLh in profileLh ? profileLh[keyLh] : undefined;
            if (!(keyLh && searchData && keyMonday)) {
                continue;
            }
            const query = getQueryProfile({ boardId, key: keyMonday, data: searchData });
            const data = (await fetchMonday(query, auth)).data.data;
            const items: any[] | null = data?.items_by_column_values ?? null;
            if (items && items.length > 0) {
                return items[0];
            }
        }
        return null;
    }

    async function createProfile(profile: any) {
        const { name, ...data } = profile;
        const profileString = JSON.stringify(data).replaceAll('"', '\\"');
        const query = getQueryCreateProfile({ boardId, name, profileString });
        return await fetchMonday(query, auth);
    }

    async function updateProfile(profile: any) {
        const { id, ...data } = profile;
        const profileString = JSON.stringify(data).replaceAll('"', '\\"');
        const query = getQueryUpdateProfile({boardId, id, profileString});
        return await fetchMonday(query, auth);
    }

    return <div className='button' onClick={handleQueue}>Start</div>
}

export default ProfileProcessing;
