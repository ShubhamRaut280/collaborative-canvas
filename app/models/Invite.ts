 

type Invite = {
    id: string;
    roomcode: string;
    email: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: Date;
}

export default Invite;