 

type Invite = {
    id: string;
    roomcode: string;
    receiver: string;
    status: 'pending' | 'accepted' | 'declined';
    createdAt: Date;
    roomName: string;
    sender : string
}

export default Invite;