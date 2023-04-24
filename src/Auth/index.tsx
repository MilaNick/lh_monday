import React, { useContext, useEffect } from 'react';

import { AuthContext } from '../App';

import './index.css';

function Auth() {
    // @ts-ignore
    const { auth, setAuth } = useContext(AuthContext);
    useEffect(() => {
        localStorage.setItem('tokenMonday', auth);
    }, [auth])
    return (
        <>
            <div className='form'>
                <div className='links-wrap'>
                    <a
                        href='https://support.monday.com/hc/en-us/articles/360005144659-Does-monday-com-have-an-API-#h_01EZ9M2KTTMA4ZJERGFQDYM4WR'
                        target='_blank'
                        rel='noreferrer'
                    >
                        Where can I find my API token?
                    </a>
                    <a href='https://gold743408.monday.com/admin/integrations/api' target='_blank' rel='noreferrer'>Link for admins users</a>
                    <a href='https://gold743408.monday.com/apps/manage/tokens' target='_blank' rel='noreferrer'>Link for non-admin users</a>
                </div>
                <label htmlFor='token'>Enter the token monday.com</label>
                <input
                    type='text'
                    id='token'
                    value={auth ?? ''}
                    onChange={(e) => {
                        setAuth(e.target.value || null);
                        localStorage.setItem('tokenMonday', auth);
                    }}
                    className='input auth__input'
                />
            </div>
        </>
    );
}

export default Auth;
