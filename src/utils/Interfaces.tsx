export type UserInterface = {
    id: string,
    name: string,
    email: string,
    location:{
        latitude: number,
        longitude: number
    },
    role: 'customer'|'retailer'|'wholesaler'
};