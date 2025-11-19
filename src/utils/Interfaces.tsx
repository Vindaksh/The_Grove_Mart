export type UserInterface = {
    id: string,
    name: string,
    email: string,
    location:{
        latitude: number,
        longitude: number
    }|null,
    role: 'customer'|'retailer'|'wholesaler'
};

export type UserDataInterface = { //for raw get_user_data return
    user_id: string,
    name: string,
    latitude: number|null,
    longitude: number|null,
    role: 'customer'|'retailer'|'wholesaler'
};