import { apiFetch } from "../api_integration/api_fetch";
import { io } from "socket.io-client";

async function getchatcontext() {
    try {
        const me = await apiFetch<any>('/api/me');
        const friends = await apiFetch<any[]>('/api/user/friends');
        return { currentuserid: me?.user?.id, friends };
    } catch (err) { return { currentuserid: null, friends: [] }; }
}

function setchatheader(friend: any, isonline: boolean) {
    const nameel = document.getElementById('name-input');
    const imgel = document.getElementById('header-avatar') as HTMLImageElement;
    const statuseel = document.getElementById('online-status');
    if (nameel) nameel.textContent = friend.username;
    if (imgel) imgel.src = `/api/avatar/${friend.id}`;
    if (statuseel) {
        statuseel.textContent = isonline ? 'online' : 'offline';
        statuseel.className = `text-xs ${isonline ? 'text-green-400' : 'text-gray-500'}`;
    }
}

export function appendmessage(data: any, currentuserid: number) {
    const container = document.getElementById('message-container');
    if (!container) return;
    const isme = Number(data.senderId) === Number(currentuserid);
    const msgli = document.createElement('li');
    msgli.className = `flex w-full mb-4 ${isme ? 'justify-end' : 'justify-start'}`;
    msgli.innerHTML = `
        <div class="flex flex-col ${isme ? 'items-end' : 'items-start'} max-w-[70%]">
            <div class="px-4 py-2 rounded-2xl ${isme ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-[#441563] text-gray-200 rounded-tl-none'}">
                ${data.content}
            </div>
        </div>`;
    container.appendChild(msgli);
    container.scrollTop = container.scrollHeight;
}

export async function setupchatlogic() {
    const { currentuserid, friends } = await getchatcontext();
    if (!currentuserid) return;

    let activechatid: number | null = null;
    const socket = io({ path: '/socket.io/', withCredentials: true });
    const sendbtn = document.getElementById('send-btn');
    const inputel = document.getElementById('chat-input') as HTMLInputElement;

    if (sendbtn && inputel) {
        sendbtn.onclick = () => {
            const content = inputel.value.trim();
            if (content && activechatid) {
                socket.emit('private_message', { to: activechatid, content: content });
                appendmessage({ senderId: currentuserid, content: content }, currentuserid);
                inputel.value = '';
            }
        };
        inputel.onkeydown = (e) => { if (e.key === 'Enter') sendbtn.click(); };
    }

    socket.on('private_message', (data: any) => {
        if (activechatid === data.from) {
            appendmessage({ senderId: data.from, content: data.content }, currentuserid);
            apiFetch('/api/messages/seen', {
                method: 'PATCH',
                body: JSON.stringify({ user_id: currentuserid, peer_id: data.from })
            });
        }
    });

    socket.on('update_user_list', (onlineids: string[]) => {
        const contactscontainer = document.getElementById('contacts');
        if (!contactscontainer) return;
        contactscontainer.innerHTML = '';
        friends.forEach((friend: any) => {
            const isonline = onlineids.includes(String(friend.id));
            const userelement = document.createElement('div');
            userelement.className = `flex items-center gap-3 p-3 hover:bg-[#441563] cursor-pointer rounded-lg transition-colors mb-2 ${activechatid === friend.id ? 'bg-[#441563]' : ''}`;
            userelement.innerHTML = `
                <div class="relative">
                    <img src="/api/avatar/${friend.id}" class="w-10 h-10 rounded-full object-cover bg-gray-600" onerror="this.src='https://ui-avatars.com/api/?name=${friend.username}'">
                    ${isonline ? '<span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#2d0b4a] rounded-full"></span>' : ''}
                </div>
                <div class="flex-1 text-left"><p class="font-medium text-sm text-white">${friend.username}</p></div>`;

            userelement.onclick = async () => {
                activechatid = friend.id;
                document.getElementById('chat-placeholder')?.classList.add('hidden');
                document.getElementById('active-chat-content')?.classList.remove('hidden');
                setchatheader(friend, isonline);
                const messagecontainer = document.getElementById('message-container');
                if (messagecontainer) {
                    messagecontainer.innerHTML = '';
                    try {
                        const history = await apiFetch<any[]>(`/api/messages?user1_id=${currentuserid}&user2_id=${friend.id}`);
                        history?.forEach((msg: any) => appendmessage(msg, currentuserid));
                        await apiFetch('/api/messages/seen', {
                            method: 'PATCH',
                            body: JSON.stringify({ user_id: currentuserid, peer_id: friend.id })
                        });
                    } catch (err) {}
                }
            };
            contactscontainer.appendChild(userelement);
        });
    });
}