export const enum Commands {

    UsersRequest = 'urq', 
    UsersResponse = 'urs', 

    InitLoadingRequest = 'ilrq',
    InitLoadingResponse = 'ilrs', 

    MessagePostReq = 'mprq',
    MessagePostRes = 'mprs',

    SearchReq = 'schrq',
    SearchRes = 'schrs',

    ChatWithUserReq = 'cwurq',
    ChatWithUserRes = 'swurs',

    GroupCreateReq = 'gcrq',
    GroupCreateRes = 'gcrs',

    GroupEditReq = 'gerq',
    GroupEditRes = 'gers',

    GroupDeleteReq = 'gdrq',
    GroupDeleteRes = 'gdrs',

    LeaveReq = 'lrq',
    LeaveRes = 'lrs', 

    TogglePinReq = 'tprq',
    TogglePinRes = 'tprs',


    // -------------- old -------------

    ChatListReq = 'clrq',
    ChatListRes = 'clrs',


    ChatSelectionWithUser = 'cswurq',
    ChatSelectionReq = 'csrq',
    ChatSelectionRes = 'csrs',


    ChatMsgReq = 'cmrq',
    ChatMsgRes = 'cmrs',

    HeaderReq = 'hrq',
    HeaderRes = 'hrs',

    SendReq = 'srq',
    SendRes = 'srs',

    UserInfoReq = 'uirq',
    UserInfoRes = 'uirs',

    GroupInfoReq = 'girq',
    GroupInfoRes = 'girs',

    OnlineReq = 'orq',
    OnlineRes = 'ors',

    TypingReq = 'trq',
    TypingRes = 'trs',
    
    NewGroupReq = 'ngrq',
    NewGroupRes = 'ngrs',

    GroupRemoveReq = 'grrq',
    GroupRemoveRes = 'grrs',

    ContactsReq = 'crq',
    ContactsRes = 'crs',

    Ping = "PNG"
}