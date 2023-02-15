import { AxiosRequestHeaders } from 'axios';

export default function authHeader(): AxiosRequestHeaders | any {
    const localstorageUser = localStorage.getItem('user');
    console.log(localstorageUser);
    if (!localstorageUser) {
        console.log('No user found in localstorage..');
        return {};
    }
    const user = JSON.parse(localstorageUser);
    if (user && user.access) {
        return { Authorization: `Token ${user.access}`};

    }
    return {};
}