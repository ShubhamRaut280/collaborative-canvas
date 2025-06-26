interface Room {
    id: string;
    name: string;
    createdAt: string;
    creator: string;
    members: Member[] | [];
    code: string;
}

interface Member {
    id: string;
    name: string;
}

export { Room, Member };