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
  let admin_sign = [
    "       `AImplink News Network Admin Panel` v0.1.4",
    "`c======================================================`\n"
  ].join("\n")
  let admin_body = [
    "`LCOMMANDS:`",
    " `Vcreate` `c-` Create new `AINN` content.",
    "   `LArguments:`",
    "   `Nid` `c-` the article ID, this is used for `Nread`/`Ncorps` {`Cstring or number`}",
    "   `Ntitle` `c-` content title, this is shown in list:true {`Cstring`}",
    "     `DIMPORTANT:` If this is a corp ad, make sure you have colour codes. e.g. title:\"\`AINN\`\"",
    "   `Ncontent` `c-` the main body, this'll usually be really long {`Cstring or array of strings`}",
    "   `Ntype` `c-` the type of content, `Vcorp_ad` or `Narticle` {`Cstring`}\n",
    " `Vmembers` `c-` View `Ladmins` and `Dsuper admins` of `AINN`.\n",
    " `Vlist` `c-` list all the current `AINN` content, and if it is `LACTIVE` or `DINACTIVE`.\n",
    " `Vset` `c-` set `AINN` content to either `LACTIVE` or `DINACTIVE`",
    "   `LArguments:`",
    "   `Naction` `c-` are you `Vpull`ing (setting to active) or `Vpush`ing (setting to inactive)? {`Cstring`}",
    "   `Nid` `c-` the content ID {`Cstring`}",
    "   `Ntype` `c-` content type, either `Vcorp_ad` or `Varticle` {`Cstring`}\n",
    " `Vupdate` `c-` update `AINN` content, you can only do this to `DINACTIVE` content.",
    "   `LArguments:`",
    "   `Nid` `c-` the content ID {`Cstring`}",
    "   `Ntype` `c-` content type, either `Vcorp_ad` or `Varticle` {`Cstring`}",
    "   `Ncontent` `c-` the `Dnew` content to be updated.",
    "\n`TQuick note:`",
    "PLEASE do not create more work for me, you have been given admin rights",
    "because you are trusted with the role, `Ddo not` abuse this and mess",
    "up `AINN` for me, that just means I revert your mistakes, and you are out."
  ].join("\n")
  //call dtrs shit
  let D = #s.dtr.lib()

  //LONG list of functions
  function dbAccess(active, id, type)
  {
    if (active == true)
      return #db.f({main:"news_network", type:type, id:id, active:true}).first()
    if (active == false)
      return #db.f({main:"news_network", type:type, id:id, active:false}).first()
    if (!active)
      return #db.f({main:"news_network", type:type, id:id}).first()
  }

  function Admin()
  {
    return []
  }

  function SuperAdmin()
  {
    let actions=[
    "`DSUPER_ADMIN COMMANDS:`",
    " `Vadd_admin` `c-` add a new admin to `AINN`.",
    "   `LArguments:`",
    "   `Nuser` `c-` specify a username {`Cstring`} [`CREQUIRED`]\n",
    " `Vremove_admin` `c-` remove an admin from `AINN`.",
    "   `LArguments:`",
    "   `Nuser` `c-` specify a username {`Cstring`} [`CREQUIRED`]\n",
    " `Vstats` `c-` modify statistics such as view count or ratings.",
    "   `LArguments:`",
    "   `Nid` `c-` id of corp_ad or article {`Cstring`}",
    "   `Ntype` `c-` specify if a `Vcorp_ad` or `Varticle` {`Cstring`}",
    "   `Nstat_type` `c-` is this `Vuplink`, `Vdownlink` or `Vviews`? {`Cstring`}",
    ""
  ]
    actions.push(...Admin())
    return actions
  }

  function AddAdmin(user)
  {//SUPER ADMIN FUNCTION
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
  {//SUPER ADMIN FUNCTION
    if(!user)
      return {ok:false,msg:"Enter valid `Nname` to remove to `AINN` admins"}

    let data=#db.f({type:"inn_admin_list"}).first();

    if(!data)
      #db.i({type:"inn_admin_list",admins:[]});

    #db.u1({type:"inn_admin_list"},{$pull:{admins:user}})

    return {ok:true, msg:"Admin " + user + " removed to `AINN`."}
  }

  function ModStats(id, type, amount, stattype)
  {//SUPER ADMIN FUNCTION
    if (!id || !type || !amount || !stattype)
      return {ok:false, msg:"Missing keys. Make sure you have `Nid`, `Ntype`, `Nchange` and `Namount`"}

    if (typeof type !== "string")
      return {ok:false,msg:"`Ntype` must be a string."}

    if (typeof id != "string" && typeof id != "number")
      return {ok:false, msg:"`Nid` must be a string or number."}

    if (typeof amount != "number")
      return {ok:false, msg:"`Namount` must be a number."}

    if (typeof change != "string")
      return {ok:false, msg:"`Nchange` must be a string."}

    if (change != "uplink" && change != "downlink" && change != "views")
      return {ok:false, msg:"`Nchange` can only be `Vuplink`, `Vdownlink` or `Vviews`"}

    if (!dbAccess(id, type))
      return {ok:false, msg:type + " does not exist. Ya idiot."}

    if (amount)
    {
      #db.u1({
      	main: "news_network",
      	id: id,
      	type: type
      }, {
      	$inc: {
      		[stattype]: amount
      	},
      	$set: {
      		date_updated: Date.now()
      	}
      })
    }

    return {ok:true, msg:"`LRESULT:`\n" + statype + " changed by: " + amount}
  }

  function contentList()
  {
    let active = #db.f({main:"news_network", active:true}).first().array()
    let inactive = #db.f({main:"news_network", active:false}).first().array()
    let ret = [
      "   `AImplink News Network Content List`",
      "`c==========================================`",
      "`LACTIVE` content:\n\n" + active.map(p => "Title - " + p.title + "\nType - " + p.type + "\nID - " + p.id + "\n"),
      "\n`c==========================================`",
      "`DINACTIVE contnet:`\n\n" +  inactive.map(p => "Title - " + p.title + "\nType - " + p.type + "\nID - " + p.id + "\n"),
      "\n`TSUMMARY:`",
      "`LACTIVE` content is what appears on list:true.",
      "By default, all new `AINN` content is marked as `DINACTIVE`,",
      "this is to prevent mistakes such as typos etc.",
      "\n`DINACTIVE` is what the user cannot see, you need to mark this content",
      "as `LACTIVE` if you want the user to be able to see it."
    ].join("\n")
    return ret
  }

  function activeSet(acttype, id, type)
  {
    if (acttype == "push") {
      if (!dbAccess(id,type))
        return {ok:false, msg:"Invalid search."}
      if (dbAccess(id, type).active == true)
        return {ok:false, msg:type + " " + id + " is already `DACTIVE`, perhaps you meant `Npull`?"}

      #db.u1({main:"news_network", id:id, type:type}, {$set: {active:true}})
    }
    if (acttype == "pull") {
      if (!dbAccess(id,type))
      return {ok:false, msg:"Invalid search."}
      if (dbAccess(id, type).active == false)
      return {ok:false, msg:type + " " + id + " is already `DINACTIVE`, contact a super admin\nif you think this content should be removed permanently from `AINN`."}

      #db.u1({main:"news_network", id:id, type:type}, {$set: {active:false}})
    }
    else
      return {Ok:false, msg:"`Naction` must be either `Vpush` or `Vpull`"}
  }


  function Corps(c)
  {
    let corp = dbAccess(true, c, "corp_ad")
    if (!corp)
      return "Invalid Corp ID"

    if (corp) {
      #db.u1({
      	main: "news_network",
      	type: "corp_ad",
      	id: c
      }, {
      	$inc: {
      		views: 1
      	}
      })
      return corp.text
    }
    else
      return {ok:false, msg:"`DCRYPTIC ERROR COR01 PLEASE NOTIFY IMPLINK`"}
  }

  function Article(art)
  {
    let article = dbAccess(true, art, "article")
    if (!article)
      return "Invalid Article ID"

    if (!args.m) {
      #s.chats.send({channel:"0000", msg:"I just read article " + art + " at implink.news_network!"})
    }
    #db.u1({
    	main: "news_network",
    	type: "article",
    	id: art
    }, {
    	$inc: {
    		views: 1
    	}
    })
    return article.text.replace('##VIEWS##', article.views).replace('##ACTIVE##', active).replace('##UPLINK##', article.uplink).replace('##DOWNLINK##', article.downlink)
  }

  function Ratings(id, type)
  {
    let access = dbAccess(true, id, type)
    if (!access){return "`DCRYPTIC ERROR RAT01 PLEASE NOTIFY IMPLINK`"}

    if (args.rate !== "uplink" && args.rate !== "downlink")
      return "`LUplink` or `DDownlink` only."

    if (access.indexOf(context.caller))
      return "You have already voted!"

    #db.u1({
    	main: "news_network",
    	type: type,
    	id: id
    }, {
    	$inc: {
    		[args.rate]: 1
    	},
    	$addToSet: {
    		voters: context.caller
    	}
    })
    return "You have successfully "+args.rate+"ed artice " + id
  }

  function AddNew(id, content, title, type)
  {
    if (!title || !id || !content || !type)
    return {ok:false, msg:"Missing keys. Make sure you have: `Ntitle`, `Nid`, `Ncontent` and `Ntype`"}

    if (dbAccess(id, type) !== null)
      return {ok:false, msg:type + " already exists on `AINN.`"}

    for (let th of [id, title, content, type]) {
      if (!args[th]) return{ok:false, msg:th + " cannot be null."}
    }
    if (typeof title !== "string")
      return {ok:false,msg:"`Ntitle` must be a string."}

    if (typeof content !== "string" && !Array.isArray(args.content))
      return {ok:false,msg:"`Ncontent` must be a string or array of strings"}

    if (typeof id != "string" && typeof id != "number")
      return {ok:false, msg:"`Nid` must be a string or number."}

    if (type != "corp_ad" && type != "article")
      return {ok:false, msg:"Invalid `Ntitle`, `V\"corp_ad\"` or `V\"article\"` only."}

    #db.i({
      main: "news_network",
      id: id,
      type: type,
      title: title,
      voters: [],
      text: content,
      uplink: 0,
      downlink: 0,
      views: 0,
      active:false,
      date_uploaded: Date.now(),
      date_updated: Date.now()
    })

    return {ok:true, msg:type + " " + title + " added to `AINN`."}
  }

  function Donations(user, amount)
  {
    let num = lib.to_gc_num(amount)
    let data = #db.f({type:"inn_donation_list", donators:[]})
    if(! #s.users.last_action({name:user}))
      return {ok:false,msg:user+" is an invalid name"}
    if(!data)
      #db.i({
      	type: "inn_donation_list",
      	donators: []
      });
    if (typeof amount !== "string" && typeof amount !== "number")
      return "what the fuck are you doing"

    if (typeof amount === "string") {
      if (typeof num === "object")
        return "Invalid GC string."
    }
    if (typeof amount === "number") {
      if (typeof num == "object")
        return "Invalid amount."
    }//Could probably do this in a for loop?

    // #db.u1({type:"inn_donation_list"},{$addToSet:{donators:[user]:amount}})
    // TODO: probably doesnt work? need a way to check if amount is 0, if so, add user, if not, inc amount >.>
  }

  let inn_admins=#db.f({type:"inn_admin_list"}).first().admins
  function MemberList()
  {
    let names=inn_admins.join(",").split(",") // this is just making a copy of the list because we are going to mutate it
    names.push(...super_admins)
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
    let sum = D.columns(super_admins.map(p =>({name:"`T# " + p + "`",la:"last active  -",last:D.formatTimeAgo(last_action[p])})),[{name:false,key:'name'},{key:"la"},{key:"last",dir:-1}],{pre:'',suf:'',sep:'  '},true)
    let sum2 = D.columns(inn_admins.map(p =>({name:"`T# " + p + "`",la:"last active  -",last:D.formatTimeAgo(last_action[p])})),[{name:false,key:'name'},{key:"la"},{key:"last",dir:-1}],{pre:'',suf:'',sep:'  '},true)
    let memlist = [
      "\n            `AImplink News Network Admin Member List:`",
      "`c=====================================================================`\n",
      "`ASUPER:`\n" + sum,
      "\n`LWhat can super admins do?`",
      "Usually control critical aspects such as adding and removing admins,",
      "changing view/rating counts as well as other critical aspects of `AINN`.\n",
      "`c=====================================================================`\n",
      "`AREGULAR:`\n" + sum2
    ].join("\n")
    return memlist
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
    "Featuring a variety of content ranging from up-to-date stories on",
    "current in-game events, to the juiciest gossip on all of your",
    "favourite users. Read interviews with top corp members and content",
    "creators, advertise your services, and stay informed. `AINN`.",

    "\n                   To view available info",
    "           Run implink.news_network{ list: true }\n",
    "        If you like `AINN` please consider supporting",
    "   us by running implink.donate ! Thanks for your support! `D<3`\n",
    "`c------------------------------------------------------------------`",
    "`ASpecial thanks to: (in order of amount donated)`",//THIS'LL SOON BE AUTO
    "`F1) @vdd`", //20BGC
    "`T2) @dtr`", //10BGC
    "`P3) @n00bish`", //10BGC
    "`L4) @amazon`", //5BGC
    "`A5) @gril`", // 3.1BGC
    ].join("\n");
    return banner
  }


  //gets us the article lists, sort by date (add spaces to pre:"" for indenting)
  let articles = #db.f({
    main: "news_network",
    type: "article"
  }, {
    _id: 0,
    title: 1,
    uplink: 1,
    downlink: 1,
    views: 1,
    date_uploaded: 1,
    active:true
  }).sort({
    date_uploaded: 1
  }).array()

  let artlist = D.columns(articles,[
    {name:"`AArticle`",key:"title"},
    {name:"`AUploaded`",key:"date_uploaded",dir:-1,func:d=>{
      var t=new Date(d);
      return [('0'+t.getDate()).slice(-2),('0'+(t.getMonth()+1)).slice(-2),t.getFullYear()].join('/')
    }},
    {name:"`AID`",key:"id",func:d=>'read:'+JSON.stringify(d)},
    {name:"`AViews`",key:"views",dir:-1},
    {name:"`AUp`",key:"views",dir:-1,func:d=>'`L+'+d+'`'},
    {name:"`ADown`",key:"views",dir:-1,func:d=>'`D-'+d+'`'}
  ],{pre:"       ",suf:"",sep:"  "},true)

  let corps = #db.f({
    main: "news_network",
    type: "corp_ad",
    active:true
  }, {
    _id: 0,
    title: 1
  }).array().sort(
    (a,b)=>a.title.slice(2,-1)<b.title.slice(2,-1)?-1:1 //REMOVE COLOUR CODES
  );

  let corplist = D.columns(articles,[
    {name:"`ACorp`",key:"title"},
    {name:"`AID`",key:"id",func:d=>'read:'+JSON.stringify(d)},
  ],{pre:"       ",suf:"",sep:"  "},true)

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
      "       `AAvilable Issues(s) :`\n" + artlist,
      // "       Issue #1 (11/20/2016):        read:1",
      // "       Gril Interview (11/22/2016):  read:\"GRIL\"",
      // "       Issue #2 (11/24/2016):        read:2",
      // "       Issue #3 (12/06/2016):        read:3",
      // "       pay.pal heist (12/07/2016):   read:\"pay\"\n",
      "       `c==========================``LCORP ADS``c==========================`",
      "       `AUse argument corps:\"<corpname>\" to view corp adverts`\n",
      "       `ACorp Adverts on implink.news_network:`\n" + corplist,
      // "       `P(HAX) Hollow_Agent_eXperimentals: corps:\"HAX\"`",
      // "       `J(ZDC) Zero_Day_Corp:              corps:\"ZDC\"`",
      // "       `A(INN) Implink News Network:       corps:\"INN\"`",
      // "       `Lgril_trust:                       corps:\"GRIL\"`",
      // "       `Dmagma_asset_management:           corps:\"magma\"`",
      // "       `LWonderland:                       corps:\"WL\"`\n",
      "       `c==========================``AJOB OFFERS``c==========================`",
      "       `AUse argument jobs:\"help\" for info on how to use the job board`\n",
      "       `AAvailable job offers, view with jobs:\"info\", id:\"id\"`\n\n",
      "\n       `c=========================``ASPONSORSHIP``c=========================`",
      "       Sponsored by n00bish.t2solver - the top t2 npc farming script!",
    ].join("\n");
    return listsign
  }


  //CORPS FOR INN
  if (args.corps)
    return Corps(args.corps)

  //ISSUES OF INN
  if (args.read){
    if (args.rate)
      return Ratings(args.read, "article")

    else
      return Article(args.read)
  }
  //ADMIN PANEL
  if (super_admins.includes(context.caller) && 'super_admin' in args) {
    if(args.super_admin=="add_admin")
      return AddAdmin(args.user);

    if(args.super_admin=="remove_admin")
      return RemoveAdmin(args.user);

    if (args.super_admin == "members")
      return MemberList();

    if (args.super_admin == "create")
      return AddNew(args.id, args.content, args.title, args.type)

    return admin_sign + SuperAdmin().join("\n") +"\n" + admin_body
  }

  if( (super_admins.includes(context.caller) || inn_admins.includes(context.caller)) && 'admin' in args) {
    if (args.admin == "members")
      return MemberList();

    if (args.admin == "create")
      return AddNew(args.id, args.content, args.title, args.type)

    if (args.admin == "list")
      return contentList()

    if (args.admin == "set")
      return activeSet(args.action, args.id, args.type)

    return admin_sign + admin_body+"\n" + Admin().join("\n")
  }
  else {
    return #s.implink.news_network({list:true})
  }
}
