function(context, args)//list:true
{
  #db.i({type:"implink_news_logger",context:context,args:args,date:Date.now()})
  if(!["implink", "dtr"].includes(context.caller)) return "Sorry, you're not invited."

  if(#s.scripts.get_level({name:context.this_script})!=4) {
      #s.chats.tell({to:"implink",msg:"`D"+context.this_script+" IS NOT FULLSEC. ABORTING WITHOUT CALLING ANYTHING. PLEASE REPORT THIS TO @implink OR @imphunter`"});
      return {ok:false}
  }
  if (context.is_scriptor != null) {return "`A:::IMPLINK_COMMUNICATION:::` Messing with scripts is unlawful. Access denied."}

  let active = #s.users.active()
  let super_admins=["implink", "imphunter"]
  let lib = #s.scripts.lib()
  let admin_header = [
    "     `AINN Admins`",
    "`c------------------------`",
    "Command List:\n",
    "`Ncreate_article` - create a new `AINN` article requires keys: `Nid`:\"<articleid>\", context:\"really long text here\""
  ].join("\n")

  function Admin()
  {
    return []
  }

  function SuperAdmin()
  {
    let actions=[
    "super_admin:\"add_admin\",name:\"username\" - add an admin",
    "super_admin:\"remove_admin\",name:\"username\" - remove an admin"
    ]
    actions.push(...Admin())
    return actions
  }

  function AddAdmin(user)
  {
    if(!user)
      return {ok:false,msg:"Enter valid `Nname` to add to `AINN` admins"}
    if(! #s.users.last_action({name:user}))
      return {ok:false,msg:user+" is an invalid name"}
    let data=#db.f({type:"inn_admin_list"}).first();
    if(!data)
      #db.i({type:"inn_admin_list",admins:[]});
    #db.u1({type:"inn_admin_list"},{$addToSet:{admins:user}})
    return {ok:true, msg:"Admin " + user + " added to `AINN`."}
  }

  function RemoveAdmin(user)
  {
    if(!user)
      return {ok:false,msg:"Enter valid `Nname` to remove to `AINN` admins"}
    let data=#db.f({type:"inn_admin_list"}).first();
    if(!data)
      #db.i({type:"inn_admin_list",admins:[]});
    #db.u1({type:"inn_admin_list"},{$pull:{admins:user}})
    return {ok:true, msg:"Admin " + user + " removed to `AINN`."}
  }

  let inn_admins=#db.f({type:"inn_admin_list"}).first().admins

  function MemberList()
  {
    let names=inn_admins.join(",").split(",") // this is just making a copy of the list because we are going to mutate it
    let actions=[]
    let last_action={};
    while(names.length>50) {
      actions.push(...#s.users.last_action({name:names.splice(0,50)}));
    }
    actions.push(...#s.users.last_action({name:names}));
    for(let i=0;i<actions.length;++i) {
      if(actions[i])
        last_action[actions[i].n]=new Date(actions[i].t||0)/1
    }
    for(let i=0;i<inn_admins.length;++i) {
      if(!last_action[inn_admins[i]] || _START-last_action[inn_admins[i]]>20*24*3600*1000) {
          RemoveAdmin(inn_admins[i]);
          inn_admins.splice(i,1);
          --i;
      }
    }
    let sum = super_admins.map(p => "`T# " + p + "`").join('\n')
    let sum2 = inn_admins.map(p => "`T# " + p + "`").join('\n')
    return "`AINN Admin Member List:`\n`c----------------------`\n`ASUPER:`\n" + sum + "\n`c----------------------`\n`AREGULAR:`\n" + sum2
  }

  function AddArticle(id, content, title) {
    if (#db.f({main: "news_network", id: id}).first() != null) return "Article already exists."

    #db.i({
      main: "news_network",
      id: id,
      title: title,
      voters: [],
      text: content,
      uplink: 0,
      downlink: 0,
      views: 0,
      date_uploaded: Date.now(),
      date_updated: Date.now()
    })
    return "Article " + id + " added to `AINN`"
  }
  if (!args || Object.keys(args).length==0) {
    let banner = [
    "                         `D*UNDER CONSTRUCTION*`",
    "                           `A_____   ___   __`  ",
    "                          `A/  _/ | / / | / /`  ",
    "                          `A/ /\/  |/ /  |/ /`  ",
    "                        `A_/ /\/ /|  / /|  /`   ",
    "                       `A/___/_/ |_/_/ |_/`     ",
    "\n                     `AImplink News Network.`",
    "\n                  `AActive Users on hackmud:` " + active,
    "`c------------------------------------------------------------------`",
    "\nhackmud’s most comprehensive news and information publication.",
    "Featuring a letiety of content ranging from up-to-date stories on",
    "current in-game events, to the juiciest gossip on all of your",
    "favourite users. Read interviews with top corp members and content",
    "creators, advertise your services, and stay informed. `AINN`.",

    "\n                   To view available info",
    "           Run implink.news_network{ list: true }\n",
    "        If you like `AINN` please consider supporting",
    "   us by running implink.donate ! Thanks for your support! `D<3`\n",
    "`c------------------------------------------------------------------`",
    "`ASpecial thanks to: (in order of amount donated)`",
    "`F1) @vdd`", //20BGC
    "`T2) @dtr`", //10BGC
    "`P3) @n00bish`", //10BGC
    "`L4) @amazon`", //5BGC
    "`A5) @gril`", // 3.1BGC
    ].join("\n");
    return banner
  }

  if (args.list == true) {
    let listsign = [
      "                            `D*UNDER CONSTRUCTION*`",
      "   `A____           ___      __     _  __                 _  __    __                  __ ` ",
      "  `A/  _/_ _  ___  / (_)__  / /__  / |/ /__ _    _____   / |/ /__ / /__    _____  ____/ /__`",
      " `A_/ /\/  ' \\/ _ \\/ / / _ \\/  '_/ /    / -_) |/|/ (_-<  /    / -_) __/ |/|/ / _ \\/ __/  '_/`",
      "`A/___/_/_/_/ .__/_/_/_/\/_/_/\\_\\ /_/|_/\\__/|__,__/___/ /_/|_/\\__/\\__/|__,__/\\___/_/ /_/\\_\\` ",
      "         `A/_/`                                                                             ",
      "                    `ACurrent Active Users on hackmud:` " + active,
      "       `c=========================``PNEWS ISSUES``c=========================`",
      "       `AUse argument read:\"<num or name>\" to view articles`\n",
      "       `ANEW: rate an article/issue with rate:\"uplink\" or rate:\"downlink\"`",
      "       `Aat the end of 'read:\"<num or name>\"'`",
      "       `AAvilable Issues(s) :`",
      "       Issue #1 (11/20/2016):        read:1",
      "       Gril Interview (11/22/2016):  read:\"GRIL\"",
      "       Issue #2 (11/24/2016):        read:2",
      "       Issue #3 (12/06/2016):        read:3",
      "       pay.pal heist (12/07/2016):   read:\"pay\"\n",
      "       `c==========================``LCORP ADS``c==========================`",
      "       `AUse argument corps:\"<corpname>\" to view corp adverts`\n",
      "       `ACorp Adverts on implink.news_network:`\n",
      "       `P(HAX) Hollow_Agent_eXperimentals: corps:\"HAX\"`",
      "       `J(ZDC) Zero_Day_Corp:              corps:\"ZDC\"`",
      "       `A(INN) Implink News Network:       corps:\"INN\"`",
      "       `Lgril_trust:                       corps:\"GRIL\"`",
      "       `Dmagma_asset_management:           corps:\"magma\"`",
      "       `LWonderland:                       corps:\"WL\"`\n",
      "       `c==========================``AJOB OFFERS``c==========================`",
      "       `AUse argument jobs:\"help\" for info on how to use the job board`\n",
      "       `AAvailable job offers, view with jobs:\"info\", id:\"id\"`\n\n",
      "\n       `c=========================``ASPONSORSHIP``c=========================`",
      "       Sponsored by n00bish.t2solver - the top t2 npc farming script!",
  ];
    return listsign.join("\n")
  }

  if (super_admins.includes(context.caller) && 'super_admin' in args) {
    if(args.super_admin=="add_admin")return AddAdmin(args.user);

    if(args.super_admin=="remove_admin")return RemoveAdmin(args.user);

    if (args.admin=="create") {
      if (!args.title || !args.id || !args.content) {
        return "Missing keys. Make sure you have: `Ntitle`, `Nid` and `Ncontent`"
      }
      if (typeof args.id !="string" && typeof args.id!="number") { return {ok:false, msg:"`Nid` must be a string or number."}}
      if (args.id.length = 0) return {ok:false, msg:"Cannot be null."}
      if (typeof args.title != "string") {return {ok:false, msg:"`Ntitle` must be as string."}}
      if (args.title.length = 0) return {ok:false, msg:"Cannot be null."}
      if (typeof args.content != "string") {return {ok:false, msg:"`Ncontent must be string.`"}}
      if (args.content.length = 0) return {ok:false, msg:"Cannot be null."}
      return AddArticle(args.title, args.id, args.content)
    }
    return admin_header+"\n"+ SuperAdmin().join("\n")
  }

  if( (super_admins.includes(context.caller) || inn_admins.includes(context.caller)) && 'admin' in args) {
    if (args.admin == "members") return MemberList();

    return admin_header+"\n" + Admin().join("\n")
  }

  //CORPS FOR INN
  function Corps(c)
  {
    let corp = #db.f({main:"news_network", type:"news_corps", id:c}).first()
    if (corp == null)
      return "Invalid Corp ID"

    return corp.text
  }
  if (args.corps)
    Corps(args.corps)

  function Article(art)
  {
    let article = #db.f({main:"news_network", id:art}).first()
    if (article == null)
      return "Invalid Article ID"

    article.text.replace('##VIEWS##', article.views).replace('##ACTIVE##', active).replace('##UPLINK##', article.uplink).replace('##DOWNLINK##', article.downlink)
  }

}
